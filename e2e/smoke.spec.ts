import { expect, test } from '@playwright/test'
import { allRoutes, trackErrors } from './routes.ts'

test.describe('every route', () => {
  for (const route of allRoutes) {
    test(`${route} renders an h1 without console errors`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.goto(route)
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page).toHaveTitle(/PyAcademy/)
      expect(errors).toEqual([])
    })
  }
})

test.describe('360 px wide', () => {
  test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true })

  for (const route of allRoutes) {
    test(`${route} has no horizontal scroll`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('main h1')).toBeVisible()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('the bottom tab bar reaches every main section', async ({ page }) => {
    await page.goto('/')
    const tabs = page.getByRole('navigation', { name: 'Main' })
    for (const [name, heading] of [
      ['Learn', 'Lessons'],
      ['Practice', 'Practice problems'],
      ['IDE', 'IDE'],
      ['Progress', 'My progress'],
      ['Home', /Train for Python/],
    ] as const) {
      await tabs.getByRole('link', { name, exact: true }).click()
      await expect(page.locator('main h1')).toHaveText(heading)
      await expect(tabs.getByRole('link', { name, exact: true })).toHaveAttribute('aria-current', 'page')
    }
    // Cheat sheets live under Learn.
    await tabs.getByRole('link', { name: 'Learn', exact: true }).click()
    await page.getByRole('main').getByRole('link', { name: /Cheat sheets/ }).click()
    await expect(page.locator('main h1')).toHaveText('Cheat sheets')
  })

  test('nested pages have a back button to their section', async ({ page }) => {
    await page.goto('/problems/sum-of-two')
    await page.getByRole('button', { name: 'Problems' }).click()
    await expect(page).toHaveURL(/\/problems$/)
    await page.getByRole('main').getByRole('link').filter({ hasText: 'Clock Time' }).first().click()
    await expect(page).toHaveURL(/\/problems\/clock-time$/)
    await page.getByRole('button', { name: 'Problems' }).click()
    await expect(page).toHaveURL(/\/problems$/)
  })
})

test('refreshing a nested route keeps the page', async ({ page }) => {
  await page.goto('/learn/fundamentals/loops')
  await expect(page.locator('main h1')).toHaveText('Loops')
  await page.reload()
  await expect(page.locator('main h1')).toHaveText('Loops')
  await page.goto('/problems/two-sum-sorted')
  await page.reload()
  await expect(page.locator('main h1')).toHaveText('Two Sum (Sorted)')
})

test('lesson pages never download Pyodide or the editor until Run', async ({ page }) => {
  const heavy: string[] = []
  page.on('request', (r) => {
    if (/pyodide|PythonEditor|InlineRun|\.worker/i.test(r.url())) heavy.push(r.url())
  })
  for (const route of ['/learn/fundamentals/input-output', '/learn/algorithms/sorting', '/cheat-sheets/stdlib-recipes']) {
    await page.goto(route)
    await expect(page.locator('main h1')).toBeVisible()
  }
  await page.waitForLoadState('networkidle')
  expect(heavy).toEqual([])
})

test('problem filters live in the URL', async ({ page }) => {
  await page.goto('/problems?difficulty=medium&tag=sorting')
  const summary = page.getByText(/^Showing \d+ of \d+ problems$/)
  await expect(summary).toBeVisible()
  const rows = page.getByRole('main').getByRole('listitem')
  const count = await rows.count()
  expect(count).toBeGreaterThan(0)
  await expect(summary).toHaveText(new RegExp(`^Showing ${count} of `))
  for (const row of await rows.all()) {
    await expect(row).toContainText('Medium')
    await expect(row).toContainText('sorting')
  }
  await page.getByLabel('Difficulty').selectOption('')
  await expect(page).toHaveURL(/\/problems\?tag=sorting$/)
})

test('fragments marked norun have Edit in IDE but no Run', async ({ page }) => {
  await page.goto('/learn/algorithms/binary-search')
  const fragment = page.locator('.code-run').filter({ hasText: 'print(first_true(' })
  await expect(fragment.getByRole('link', { name: 'Edit in IDE' })).toBeVisible()
  await expect(fragment.getByRole('button', { name: 'Copy code' })).toBeVisible()
  await expect(fragment.getByRole('button', { name: 'Run', exact: true })).toHaveCount(0)
  // Whole programs on the same page still run.
  const runnable = page.locator('.code-run').filter({ has: page.getByRole('button', { name: 'Run', exact: true }) })
  expect(await runnable.count()).toBeGreaterThan(0)
})

test('marking a lesson complete survives a reload', async ({ page }) => {
  await page.goto('/learn/fundamentals/strings')
  await page.getByRole('button', { name: 'Mark as complete' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: /Completed/ })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/progress')
  await expect(page.getByRole('main').getByRole('listitem').getByRole('link', { name: 'Strings' })).toBeVisible()
})
