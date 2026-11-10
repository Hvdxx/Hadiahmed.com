import { expect, test } from '@playwright/test';

test('index lists every published entry', async ({ page }) => {
  await page.goto('entries');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Index');
  await expect(page.locator('.idx li')).toHaveCount(6);
});

test('projects page shows only projects and marks its filter as current', async ({ page }) => {
  await page.goto('projects');
  const rows = page.locator('.idx li');
  await expect(rows).toHaveCount(3);
  for (const t of await rows.evaluateAll((els) => els.map((e) => e.getAttribute('data-type')))) expect(t).toBe('project');
  await expect(page.locator('.filters a[aria-current="page"]')).toContainText('Project');
});

test('writing page says nothing is there yet', async ({ page }) => {
  await page.goto('writing');
  await expect(page.getByText('Nothing here yet.')).toBeVisible();
});

test('a post page shows its title, photo, dates and neighbours', async ({ page }) => {
  await page.goto('posts/gen-z-ethics-competition');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Gen Z Ethics Competition with KPMG');
  await expect(page.locator('article figure img')).toHaveAttribute('alt', /.+/);
  await expect(page.locator('article time[datetime="2024-09-01"]')).toHaveText('Sep 1, 2024');
  await expect(page.locator('article')).toContainText(/\d+ min read/);
  const nav = page.getByRole('navigation', { name: 'More entries' });
  await expect(nav.getByRole('link')).toHaveCount(2);
});

test('about page carries the resume', async ({ page }) => {
  await page.goto('about');
  await expect(page.locator('main')).toContainText('3.5');
  await expect(page.locator('main')).toContainText('Flooring Specialist');
  await expect(page.locator('main')).toContainText('MISSO');
});

test('photos page shows all eight photos with descriptions', async ({ page }) => {
  await page.goto('photos');
  const imgs = page.locator('main figure img');
  await expect(imgs).toHaveCount(8);
  for (const alt of await imgs.evaluateAll((els) => els.map((e) => e.getAttribute('alt') ?? ''))) expect(alt.trim()).not.toBe('');
});

test('rss feed has one item per entry', async ({ request }) => {
  const res = await request.get('rss.xml');
  expect(res.status()).toBe(200);
  expect(((await res.text()).match(/<item>/g) ?? []).length).toBe(6);
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

test('embedded device post shows the handheld and the desk photos', async ({ page }) => {
  await page.goto('posts/embedded-device-configuration');
  await expect(page.locator('article figure.hero-img img')).toHaveAttribute('alt', /.+/);
  const inText = page.locator('article .prose img');
  await expect(inText).toHaveCount(3);
  for (const alt of await inText.evaluateAll((els) => els.map((e) => e.getAttribute('alt') ?? ''))) expect(alt.trim()).not.toBe('');
});
