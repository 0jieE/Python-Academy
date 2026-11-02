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

  test('the menu reaches every main section', async ({ page }) => {
    await page.goto('/')
    for (const name of ['Learn', 'Cheat sheets', 'Problems', 'Playground', 'My progress']) {
      await page.getByRole('button', { name: /open menu/i }).click()
      await page.getByRole('dialog').getByRole('link', { name }).click()
      await expect(page.locator('main h1')).toBeVisible()
      await expect(page.getByRole('dialog')).toBeHidden()
    }
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

test('lesson pages never download Pyodide or Monaco', async ({ page }) => {
  const heavy: string[] = []
  page.on('request', (r) => {
    if (/pyodide|monaco|\.worker/i.test(r.url())) heavy.push(r.url())
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
  await expect(page.getByText(/^Showing 2 of \d+ problems$/)).toBeVisible()
  await page.getByRole('button', { name: 'All', exact: true }).click()
  await expect(page).toHaveURL(/\/problems\?tag=sorting$/)
})

test('marking a lesson complete survives a reload', async ({ page }) => {
  await page.goto('/learn/fundamentals/strings')
  await page.getByRole('button', { name: 'Mark as complete' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: /Completed/ })).toHaveAttribute('aria-pressed', 'true')
  await page.goto('/progress')
  await expect(page.getByRole('main').getByRole('listitem').getByRole('link', { name: 'Strings' })).toBeVisible()
})
