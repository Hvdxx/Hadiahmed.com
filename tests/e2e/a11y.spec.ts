import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const ROUTES = ['', 'entries', 'projects', 'work', 'personal', 'writing', 'photos', 'about', 'posts/gen-z-ethics-competition', 'posts/embedded-device-configuration', 'does-not-exist'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`accessibility (${scheme})`, () => {
    test.use({ colorScheme: scheme });
    for (const route of ROUTES) {
      test(`/${route} has no serious or critical problems`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        // Let the load fade-in finish so contrast is measured on the final colors
        await page.waitForTimeout(800);
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        const bad = violations
          .filter((v) => v.impact === 'serious' || v.impact === 'critical')
          .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
        expect(bad, bad.join('\n')).toEqual([]);
      });
    }
  });
}
