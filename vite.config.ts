/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import mdx from '@mdx-js/rollup'
import rehypeShiki from '@shikijs/rehype'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import type { ShikiTransformer } from 'shiki'
import { defineConfig } from 'vite'

/**
 * <pre data-language="python"> → the MDX `pre` component (RunnableCode) adds a Run button.
 * ```python norun → <pre data-norun>: a fragment, shown with Copy and Edit in IDE only.
 */
const dataLanguage: ShikiTransformer = {
  name: 'data-language',
  pre(node) {
    node.properties.dataLanguage = this.options.lang
    const meta = (this.options.meta as { __raw?: string } | undefined)?.__raw ?? ''
    if (/(^|\s)norun(\s|$)/.test(meta)) node.properties.dataNorun = ''
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // MDX must run before the React plugin so .mdx compiles to JSX first.
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMdxFrontmatter],
        // Shiki highlights code blocks at BUILD time: zero runtime JS on lesson pages.
        rehypePlugins: [
          [
            rehypeShiki,
            {
              themes: { light: 'github-light-default', dark: 'github-dark-default' },
              defaultColor: false,
              transformers: [dataLanguage],
            },
          ],
        ],
      }),
    },
    react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  worker: { format: 'es' },
  // Playwright specs in e2e/ run with `npm run test:e2e`, not Vitest.
  test: { exclude: ['**/node_modules/**', 'e2e/**'] },
})
