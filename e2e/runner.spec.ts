import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { manifest, trackErrors } from './routes.ts'

// These download Pyodide (~6 MB) from jsDelivr: skip with `npm run test:e2e:fast`.
test.describe('Python runner', { tag: '@slow' }, () => {
  test.setTimeout(120_000)

  // While the input sheet (a modal) is open the page behind it is hidden from
  // the accessibility tree, so the console is located by CSS here.
  const consoleText = (page: import('@playwright/test').Page) => page.locator('pre[aria-label="Program output"]')

  test('IDE asks for input in a sheet and echoes it in the console', async ({ page }) => {
    const errors = trackErrors(page)
    const hash = new URLSearchParams({ code: 'a, b = map(int, input("Two numbers: ").split())\nprint(a + b)\n', stdin: '3 4' })
    await page.goto(`/playground#${hash}`)
    await page.getByRole('button', { name: 'Run', exact: true }).click()

    const sheet = page.getByRole('dialog', { name: 'Your program is waiting for input' })
    await expect(sheet).toBeVisible({ timeout: 90_000 })
    await expect(sheet.getByText('Two numbers:')).toBeVisible()
    // The input that came with the link is one tap away.
    await sheet.getByRole('button', { name: 'Use example input' }).click()
    await expect(sheet.getByLabel('Input line')).toHaveValue('3 4')
    await sheet.getByLabel('Input line').press('Enter')

    await expect(sheet).toBeHidden()
    await expect(consoleText(page)).toHaveText('Two numbers: 3 4\n7\n')
    await expect(page.locator('section[aria-label="Output"] mark')).toHaveText('3 4\n')
    await expect(page.getByRole('status').filter({ hasText: /^Finished in \d+ ms/ })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('the input sheet passes axe', async ({ page }) => {
    await page.goto(`/playground#${new URLSearchParams({ code: 'print(input("Name? "))\n' })}`)
    await page.getByRole('button', { name: 'Run', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 90_000 })
    await expect(page.getByLabel('Input line')).toBeFocused()
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([])
  })

  test('lesson code runs in place: example input, then the student’s own input', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/learn/algorithms/recursion')
    const example = page.locator('.code-run').filter({ hasText: 'All subsets' })
    await example.getByRole('button', { name: 'Run', exact: true }).click()
    const out = example.locator('pre[aria-label="Program output"]')
    await expect(out).toContainText('[1, 2, 3]', { timeout: 90_000 })
    await expect(out).toHaveText(/^1 2 3\n\[\]\n\[3\]\n/)

    await example.getByRole('button', { name: 'Type my own input' }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await sheet.getByLabel('Input line').fill('7 8')
    await sheet.getByRole('button', { name: 'Send line' }).click()
    await expect(out).toContainText('[7, 8]')

    // A plain code block (no example input) runs too.
    await page.getByText('Show answer').first().click()
    const answer = page.locator('.code-run').filter({ hasText: 'def power' })
    await answer.getByRole('button', { name: 'Run', exact: true }).click()
    await sheet.getByLabel('Input line').fill('2 10')
    await sheet.getByLabel('Input line').press('Enter')
    await expect(answer.locator('pre[aria-label="Program output"]')).toHaveText('2 10\n1024\n')
    expect(errors).toEqual([])
  })

  test('problem console offers each sample as input', async ({ page }) => {
    await page.goto('/problems/sum-of-two')
    await page.getByRole('button', { name: 'Run', exact: true }).click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible({ timeout: 90_000 })
    await expect(sheet.getByRole('button', { name: /^Use sample 1/ })).toBeVisible()
  })

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
        const editor = page.getByRole('textbox', { name: /your solution/i })
        await expect(editor).toHaveClass(/cm-content/) // CodeMirror, not the loading fallback
        await editor.fill(code ?? '')
        await page.getByRole('button', { name: 'Run samples', exact: true }).click()
        const n = problem.sampleTests?.length ?? 0
        await expect(page.getByRole('status').filter({ hasText: /samples passed/ })).toHaveText(`All ${n} samples passed.`, { timeout: 90_000 })
      })
    }
  })
})
