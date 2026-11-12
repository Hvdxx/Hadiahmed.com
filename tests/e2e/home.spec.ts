import { expect, test } from '@playwright/test';
import { countOf, newest, pretty, profile, published } from './content';

test.describe('home page', () => {
  test('introduces Hadi', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hadi Ahmed');
    await expect(page.locator('.hero p.intro')).toContainText(profile.intro.trim().slice(0, 40));
    await expect(page.locator('.hero')).toContainText(profile.status);
  });

  test("has a Let's talk link at the top that goes to contact", async ({ page }) => {
    await page.goto('./');
    const talk = page.getByRole('banner').getByRole('link', { name: "Let's talk" });
    await expect(talk).toHaveAttribute('href', /#contact$/);
  });

  test('lists every way to get in touch', async ({ page }) => {
    await page.goto('./');
    const contact = page.locator('#contact');
    await expect(contact).toContainText(profile.contact.phone);
    await expect(contact).toContainText(profile.contact.email);
    await expect(contact).toContainText(profile.contact.instagramHandle);
    await expect(contact.getByRole('link', { name: /resume/i }).first()).toHaveAttribute('href', /resume\.pdf$/);
    await expect(contact.locator(`a[href="${profile.contact.phoneHref}"]`)).toHaveCount(1);
    await expect(contact.locator(`a[href="mailto:${profile.contact.email}"]`)).toHaveCount(1);
  });

  test('features the newest entry with date, time ago, reading time and photo', async ({ page }) => {
    await page.goto('./');
    const latest = page.locator('.latest');
    await expect(latest.locator('h3')).toHaveText(newest.title);
    await expect(latest.locator(`time[datetime="${newest.date}"]`)).toHaveText(pretty(newest.date));
    await expect(latest.locator('[data-ago]')).toHaveText(/ago|Today|Yesterday/);
    await expect(latest).toContainText(/\d+ min read/);
    if (newest.image) await expect(latest.locator('img')).toHaveAttribute('alt', /.+/);
    else await expect(latest.locator('img')).toHaveCount(0);
  });

  test('filters the index by type', async ({ page }) => {
    await page.goto('./');
    const projects = countOf('project');
    await page.getByRole('button', { name: /^Project/ }).click();
    const visible = page.locator('.idx li:visible');
    await expect(visible).toHaveCount(projects);
    for (const t of await visible.evaluateAll((els) => els.map((e) => e.getAttribute('data-type')))) expect(t).toBe('project');
    await expect(page.getByRole('button', { name: /^Project/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.idx-live')).toHaveText(new RegExp(`Showing ${projects} Project entr`));
    await page.getByRole('button', { name: /^All/ }).click();
    await expect(page.locator('.idx li:visible')).toHaveCount(Math.min(published.length, 8));
  });

  test('follows the light setting with a soft warm background', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto('./');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(226, 220, 208)');
    await ctx.close();
  });

  test('follows the dark setting with the navy background', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('./');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(12, 23, 38)');
    await ctx.close();
  });

  test('theme toggle overrides the setting and is remembered', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto('./');
    await page.getByRole('button', { name: /switch to light theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(226, 220, 208)');
    await ctx.close();
  });

  test('skip link comes first', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Skip to content');
  });
});

test('copy buttons announce the result to screen readers', async ({ browser }) => {
  const ctx = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto('./');
  await page.getByRole('button', { name: 'Copy email address' }).click();
  await expect(page.locator('#copy-status')).toHaveText('Email address copied');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.contact.email);
  await ctx.close();
});

test('headshot is centered on phones', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const box = (await page.locator('.hero .portrait').boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - 390 / 2)).toBeLessThanOrEqual(2);
});

test('light mode is soft (dim warm paper) with a warm spotlight that still shows', async ({ browser }) => {
  const ctx = await browser.newContext({ colorScheme: 'light' });
  const page = await ctx.newPage();
  await page.goto('./');
  const [glow, bg, panel] = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    return ['--glow1', '--bg', '--panel'].map((v) => s.getPropertyValue(v).trim());
  });
  const rgb = (c: string) => c.startsWith('#') ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/[\d.]+/g)!.map(Number);
  const lum = (c: string) => {
    const [r, g, b] = rgb(c).slice(0, 3).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  expect(lum(bg)).toBeLessThanOrEqual(0.72); // no bright white page
  expect(lum(panel)).toBeLessThanOrEqual(0.78); // cards don't glare either
  const [r, g, b, a] = rgb(glow);
  expect(lum(`#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`)).toBeGreaterThan(lum(bg) + 0.1); // spotlight still lighter than the page
  expect(r).toBeGreaterThan(b); // and warm, not blue-white
  expect(a).toBeGreaterThanOrEqual(0.6);
  await ctx.close();
});

test.describe('home gallery slideshow', () => {
  test('shows every gallery photo with a description, one at a time', async ({ page }) => {
    await page.goto('./');
    const show = page.locator('[aria-roledescription="carousel"]');
    await expect(show).toBeVisible();
    const slides = show.locator('[aria-roledescription="slide"]');
    expect(await slides.count()).toBeGreaterThan(4);
    for (const d of await slides.locator('.desc').allTextContents()) expect(d.trim()).not.toBe('');
    await expect(show.getByRole('link', { name: /view all/i })).toHaveAttribute('href', /gallery$/);
  });

  test('next and previous buttons move one photo and update the counter', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // no autoplay while we test
    await page.goto('./');
    const counter = page.locator('.ss-count');
    const read = async () => (await counter.textContent())!.match(/(\d+) of (\d+)/)!.slice(1).map(Number);
    const [start, total] = await read();
    await page.getByRole('button', { name: 'Next photo' }).click();
    await expect(counter).toHaveText(`${(start % total) + 1} of ${total}`);
    await page.getByRole('button', { name: 'Previous photo' }).click();
    await expect(counter).toHaveText(`${start} of ${total}`);
  });

  test('plays on its own and can be paused', async ({ page }) => {
    await page.goto('./');
    const toggle = page.getByRole('button', { name: /pause slideshow/i });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole('button', { name: /play slideshow/i })).toBeVisible();
  });

  test('does not play on its own when the visitor prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
    await expect(page.getByRole('button', { name: /play slideshow/i })).toBeVisible();
  });
});
