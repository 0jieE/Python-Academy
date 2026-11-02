import { expect, test } from '@playwright/test'
import { manifest, trackErrors } from './routes.ts'

// These download Pyodide (~6 MB) from jsDelivr: skip with `npm run test:e2e -- --grep-invert @slow`.
test.describe('Python runner', { tag: '@slow' }, () => {
  test.setTimeout(120_000)

  test('playground runs a program with stdin and prints 7', async ({ page }) => {
    const errors = trackErrors(page)
    const hash = new URLSearchParams({ code: 'a, b = map(int, input().split())\nprint(a + b)\n', stdin: '3 4' })
    await page.goto(`/playground#${hash}`)
    await page.getByRole('button', { name: 'Run', exact: true }).click()
    await expect(page.getByLabel('Program output')).toHaveText('7', { timeout: 90_000 })
    await expect(page.getByRole('status').filter({ hasText: /^Finished in \d+ ms/ }).first()).toBeVisible()
    expect(errors).toEqual([])
  })

  // Narrow screen → the textarea editor, so the code can be filled like a student types it.
  test.describe('every editorial passes its own samples', () => {
    test.use({ viewport: { width: 400, height: 900 } })

    for (const problem of manifest.problems) {
      test(problem.slug, async ({ page }) => {
        await page.goto(problem.url)
        await page.getByRole('button', { name: /show editorial/i }).click()
        const blocks = page.locator('#editorial-heading ~ div pre.shiki')
        await expect(blocks.first()).toBeVisible()
        // AUTHORING.md: the last python block in an editorial is the reference solution.
        const code = await blocks.last().textContent()
        await page.getByRole('textbox', { name: /your solution/i }).fill(code ?? '')
        await page.getByRole('button', { name: 'Run samples', exact: true }).click()
        const n = problem.sampleTests?.length ?? 0
        await expect(page.getByRole('status').filter({ hasText: /samples passed/ })).toHaveText(`All ${n} samples passed.`, { timeout: 90_000 })
      })
    }
  })
})
