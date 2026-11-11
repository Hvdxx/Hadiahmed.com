import { expect, test } from '@playwright/test';
import { newest, pretty } from './content';

test('every internal link and image resolves', async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const seen = new Set<string>();
  const pages = [baseURL!];
  const broken: string[] = [];

  for (let depth = 0; depth < 2; depth++) {
    const next: string[] = [];
    for (const p of pages) {
      await page.goto(p);
      const refs = await page.evaluate(() => [
        ...[...document.querySelectorAll('a[href]')].map((a) => (a as HTMLAnchorElement).href),
        ...[...document.querySelectorAll('img')].map((i) => (i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src),
        ...[...document.querySelectorAll('link[rel="icon"], link[rel="alternate"]')].map((l) => (l as HTMLLinkElement).href),
      ]);
      for (const ref of refs) {
        const u = new URL(ref);
        if (u.origin !== origin) continue;
        u.hash = '';
        const key = u.toString();
        if (seen.has(key)) continue;
        seen.add(key);
        const res = await request.get(key);
        if (res.status() >= 400) broken.push(`${res.status()} ${key} (from ${p})`);
        if (!/\.(pdf|xml|svg|webp|jpe?g|png|avif)$/.test(u.pathname) && res.ok()) next.push(key);
      }
    }
    pages.splice(0, pages.length, ...next);
  }
  expect(seen.size).toBeGreaterThan(15);
  expect(broken, broken.join('\n')).toEqual([]);
});

test.describe('in Houston', () => {
  test.use({ timezoneId: 'America/Chicago' });
  test('post dates show the same calendar day as the file', async ({ page }) => {
    await page.goto(`posts/${newest.id}`);
    await expect(page.locator('article time')).toHaveText(pretty(newest.date));
  });
});

for (const route of ['', `posts/${newest.id}`, 'about', 'entries']) {
  test(`/${route} fits a 320px screen`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
}

test.describe('drafts', () => {
  test.skip(!process.env.E2E_DRAFT_CHECK, 'run with npm run test:drafts');
  test('a draft appears nowhere', async ({ page, request }) => {
    for (const route of ['', 'entries', 'personal']) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('Draft Should Not Show');
    }
    expect(await (await request.get('rss.xml')).text()).not.toContain('Draft Should Not Show');
    expect((await request.get('posts/zz-draft-test')).status()).toBe(404);
  });
});

test.describe('post photo rows', () => {
  test.skip(!process.env.E2E_DRAFT_CHECK, 'run with npm run test:drafts');
  const box = async (page: import('@playwright/test').Page, sel: string) => (await page.locator(sel).boundingBox())!;

  test('alternate text and photo sides on wide screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('posts/zz-layout-test');
    await expect(page.locator('.photo-row')).toHaveCount(2);
    const t1 = await box(page, '.photo-row >> nth=0 >> .row-text');
    const m1 = await box(page, '.photo-row >> nth=0 >> .row-media');
    const t2 = await box(page, '.photo-row >> nth=1 >> .row-text');
    const m2 = await box(page, '.photo-row >> nth=1 >> .row-media');
    expect(t1.x).toBeLessThan(m1.x); // text left, photo right
    expect(t2.x).toBeGreaterThan(m2.x); // flipped
    await expect(page.locator('.photo-row >> nth=1 >> .row-media')).toContainText('Caption for photo two');
  });

  test('stack text above photo on phones', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('posts/zz-layout-test');
    for (const i of [0, 1]) {
      const t = await box(page, `.photo-row >> nth=${i} >> .row-text`);
      const m = await box(page, `.photo-row >> nth=${i} >> .row-media`);
      expect(t.y).toBeLessThan(m.y);
    }
  });

  test('rows appear as you scroll to them', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto('posts/zz-layout-test');
    const row = page.locator('.photo-row').nth(1);
    expect(await row.evaluate((e) => e.getBoundingClientRect().top > innerHeight)).toBe(true); // starts off screen
    expect(await row.evaluate((e) => getComputedStyle(e).opacity)).toBe('0');
    await row.scrollIntoViewIfNeeded();
    await expect.poll(() => row.evaluate((e) => getComputedStyle(e).opacity), { timeout: 3000 }).toBe('1');
  });

  test('rows are simply visible for visitors who prefer reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('posts/zz-layout-test');
    expect(await page.locator('.photo-row').nth(1).evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
  });
});
