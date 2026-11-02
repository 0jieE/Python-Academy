import { expect, test } from '@playwright/test'

// Installable app: manifest + icons, and pages that open offline once visited.
test.describe('installable app', () => {
  test.use({ serviceWorkers: 'allow' })

  test('manifest and icons are served', async ({ page, request }) => {
    await page.goto('/')
    const href = await page.locator('link[rel="manifest"]').getAttribute('href')
    const manifest = await (await request.get(href!)).json()
    expect(manifest).toMatchObject({ display: 'standalone', start_url: '/', short_name: 'PyAcademy' })
    const purposes = (manifest.icons as { src: string; sizes: string; purpose: string }[]).map((i) => `${i.sizes} ${i.purpose}`)
    expect(purposes).toEqual(expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']))
    for (const icon of manifest.icons as { src: string }[]) {
      const res = await request.get(icon.src)
      expect(res.headers()['content-type']).toBe('image/png')
    }
  })

  test('works offline after the first visit', async ({ page, context }) => {
    test.setTimeout(60_000)
    await page.goto('/')
    // The service worker precaches the whole build, then takes control.
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))
    })
    await context.setOffline(true)
    for (const [url, heading] of [
      ['/learn/algorithms/dp-intro', 'Dynamic Programming'],
      ['/problems/stair-climb', 'Stair Climb'],
      ['/cheat-sheets/fast-io', /./],
    ] as const) {
      await page.goto(url)
      await expect(page.locator('main h1')).toHaveText(heading)
    }
    // The IDE's editor is part of the precache too.
    await page.goto('/playground')
    await expect(page.locator('.cm-content')).toBeVisible()
    await expect(page.getByRole('status').filter({ hasText: /^Offline/ })).toBeVisible()
  })

  test('Python runs offline once it has loaded', { tag: '@slow' }, async ({ page, context }) => {
    test.setTimeout(120_000)
    const output = page.locator('pre[aria-label="Program output"]')
    await page.goto('/')
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready
      if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener('controllerchange', r, { once: true }))
    })
    await page.goto(`/playground#${new URLSearchParams({ code: 'print(sum(range(10)))\n' })}`)
    await page.getByRole('button', { name: 'Run', exact: true }).click()
    await expect(output).toHaveText('45\n', { timeout: 90_000 })

    // Pyodide came from the CDN through the service worker's runtime cache.
    await context.setOffline(true)
    await page.goto('about:blank')
    await page.goto(`/playground#${new URLSearchParams({ code: 'print("offline", 6 * 7)\n' })}`)
    await page.getByRole('button', { name: 'Run', exact: true }).click()
    await expect(output).toHaveText('offline 42\n', { timeout: 60_000 })
  })
})
