import { expect, test } from '@playwright/test';
import { countOf, photos, pretty, profile, published, withImage } from './content';

test('index lists every published entry', async ({ page }) => {
  await page.goto('entries');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Index');
  await expect(page.locator('.idx li')).toHaveCount(published.length);
});

test('projects page shows only projects and marks its filter as current', async ({ page }) => {
  await page.goto('projects');
  const rows = page.locator('.idx li');
  await expect(rows).toHaveCount(countOf('project'));
  for (const t of await rows.evaluateAll((els) => els.map((e) => e.getAttribute('data-type')))) expect(t).toBe('project');
  await expect(page.locator('.filters a[aria-current="page"]')).toContainText('Project');
});

test('writing page lists writing entries, or says nothing is there yet', async ({ page }) => {
  await page.goto('writing');
  if (countOf('writing') === 0) await expect(page.getByText('Nothing here yet.')).toBeVisible();
  else await expect(page.locator('.idx li')).toHaveCount(countOf('writing'));
});

test('a post page shows its title, photo, dates and neighbours', async ({ page }) => {
  await page.goto(`posts/${withImage.id}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(withImage.title);
  await expect(page.locator('article figure img')).toHaveAttribute('alt', /.+/);
  await expect(page.locator(`article time[datetime="${withImage.date}"]`)).toHaveText(pretty(withImage.date));
  await expect(page.locator('article')).toContainText(/\d+ min read/);
  if (published.length > 1) await expect(page.getByRole('navigation', { name: 'More entries' }).getByRole('link').first()).toBeVisible();
});

test('about page carries the resume', async ({ page }) => {
  await page.goto('about');
  await expect(page.locator('main')).toContainText(profile.education[0].gpa);
  await expect(page.locator('main')).toContainText(profile.experience[0].role);
  await expect(page.locator('main')).toContainText(profile.leadership[0].role);
});

test('photos page shows all eight photos with descriptions', async ({ page }) => {
  await page.goto('photos');
  const imgs = page.locator('main figure img');
  await expect(imgs).toHaveCount(photos.length);
  for (const alt of await imgs.evaluateAll((els) => els.map((e) => e.getAttribute('alt') ?? ''))) expect(alt.trim()).not.toBe('');
});

test('rss feed has one item per entry', async ({ request }) => {
  const res = await request.get('rss.xml');
  expect(res.status()).toBe(200);
  expect(((await res.text()).match(/<item>/g) ?? []).length).toBe(published.length);
});

test('admin points to the editor', async ({ page }) => {
  await page.goto('admin');
  await expect(page.locator('a[href="https://app.pagescms.org/"]')).toHaveCount(1);
});

test('unknown pages get a friendly 404', async ({ page }) => {
  const res = await page.goto('does-not-exist');
  expect(res?.status()).toBe(404);
  await expect(page.getByText("That page doesn't exist.")).toBeVisible();
});

test('every photo inside every post has a description', async ({ page }) => {
  for (const e of published) {
    await page.goto(`posts/${e.id}`);
    for (const alt of await page.locator('article img').evaluateAll((els) => els.map((x) => x.getAttribute('alt') ?? ''))) {
      expect(alt.trim(), `${e.id} has an image without a description`).not.toBe('');
    }
  }
});

test('photos placed together in a post sit side by side on wide screens', async ({ page }) => {
  // Any post whose Markdown has image lines with no blank line between them
  const { readFileSync } = await import('node:fs');
  const post = published.find((e) => /!\[[^\]]*\]\([^)]*\)\n!\[/.test(readFileSync(`src/content/posts/${e.id}.md`, 'utf8')));
  test.skip(!post, 'no post groups photos yet');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`posts/${post!.id}`);
  const group = page.locator('.prose p:has(> img + img)').first();
  const tops = await group.locator('img').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops.slice(0, 2)).size).toBe(1);
});
