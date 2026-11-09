import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('introduces Hadi', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hadi Ahmed');
    await expect(page.locator('.hero p.intro')).toContainText("Hey! I'm Hadi.");
    await expect(page.locator('.hero')).toContainText('Open to summer internships');
  });

  test("has a Let's talk link at the top that goes to contact", async ({ page }) => {
    await page.goto('./');
    const talk = page.getByRole('banner').getByRole('link', { name: "Let's talk" });
    await expect(talk).toHaveAttribute('href', /#contact$/);
  });

  test('lists every way to get in touch', async ({ page }) => {
    await page.goto('./');
    const contact = page.locator('#contact');
    await expect(contact).toContainText('(281) 965-5448');
    await expect(contact).toContainText('Hadiahmed350@gmail.com');
    await expect(contact).toContainText('@_hadi.ahmed_');
    await expect(contact.getByRole('link', { name: /resume/i }).first()).toHaveAttribute('href', /resume\.pdf$/);
    await expect(contact.locator('a[href="tel:+12819655448"]')).toHaveCount(1);
    await expect(contact.locator('a[href="mailto:Hadiahmed350@gmail.com"]')).toHaveCount(1);
  });

  test('features the newest entry with date, time ago, reading time and photo', async ({ page }) => {
    await page.goto('./');
    const latest = page.locator('.latest');
    await expect(latest).toContainText('A few frames from around Houston');
    await expect(latest.locator('time[datetime="2026-04-15"]')).toHaveText('Apr 15, 2026');
    await expect(latest.locator('[data-ago]')).toHaveText(/ago|Today|Yesterday/);
    await expect(latest).toContainText(/\d+ min read/);
    await expect(latest.locator('img')).toHaveAttribute('alt', /.+/);
  });

  test('filters the index by type', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: /^Project/ }).click();
    const visible = page.locator('.idx li:visible');
    await expect(visible).toHaveCount(3);
    for (const t of await visible.evaluateAll((els) => els.map((e) => e.getAttribute('data-type')))) expect(t).toBe('project');
    await expect(page.getByRole('button', { name: /^Project/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.idx-live')).toHaveText(/Showing 3 Project entries/);
    await page.getByRole('button', { name: /^All/ }).click();
    await expect(page.locator('.idx li:visible')).toHaveCount(6);
  });

  test('follows the light setting with a 4000K paper background', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto('./');
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(247, 243, 236)');
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
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(247, 243, 236)');
    await ctx.close();
  });

  test('skip link comes first', async ({ page }) => {
    await page.goto('./');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Skip to content');
  });
});
