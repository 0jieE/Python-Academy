import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { allRoutes } from './routes.ts'

// Every page: code-block colours (Shiki themes) differ per page, so check them all.
const pages = allRoutes

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`axe (${scheme})`, () => {
    test.use({ colorScheme: scheme })

    for (const route of pages) {
      test(route, async ({ page }) => {
        await page.goto(route)
        await expect(page.locator('main h1')).toBeVisible()
        // Let lazy MDX/editor chunks settle so axe sees the final page.
        await page.waitForLoadState('networkidle')
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
        const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)
        expect(summary).toEqual([])
      })
    }
  })
}

test('keyboard: skip link first, then visible focus on the header', async ({ page }) => {
  await page.goto('/learn/fundamentals/loops')
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to content' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeVisible()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  // Focus moved into the main content, past the header.
  expect(await page.evaluate(() => !!document.activeElement?.closest('main'))).toBe(true)
})

test('run status is announced politely', async ({ page }) => {
  await page.goto('/playground')
  await expect(page.locator('section[aria-label="Output"] [role="status"][aria-live="polite"]')).toHaveCount(1)
})
