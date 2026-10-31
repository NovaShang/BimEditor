import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const sampleDataDir = path.resolve(__dirname, '..', 'sample_data')

export default defineConfig({
  plugins: [
    {
      name: 'serve-sample-data',
      configureServer(server) {
        const watchClients = new Set<import('http').ServerResponse>()

        if (fs.existsSync(sampleDataDir)) {
          fs.watch(sampleDataDir, { recursive: true }, (_event, filename) => {
            if (!filename) return
            const normalized = filename.replace(/\\/g, '/')
            const data = JSON.stringify({ type: 'change', path: normalized })
            for (const client of watchClients) {
              client.write(`data: ${data}\n\n`)
            }
          })
        }

        server.middlewares.use((req, res, next) => {
          const url = req.url || ''

          if (url === '/api/save' && req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                const { model, files } = JSON.parse(body) as { model?: string; files: { path: string; content: string }[] }
                const modelDir = model ? path.join(sampleDataDir, model) : sampleDataDir
                for (const file of files) {
                  const filePath = path.join(modelDir, file.path)
                  if (!filePath.startsWith(sampleDataDir)) continue
                  const dir = path.dirname(filePath)
                  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
                  fs.writeFileSync(filePath, file.content, 'utf-8')
                }
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ ok: true, written: files.length }))
              } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: String(err) }))
              }
            })
            return
          }

          if (url === '/api/watch' && req.method === 'GET') {
            res.writeHead(200, {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            })
            res.write('data: {"type":"connected"}\n\n')
            watchClients.add(res)
            req.on('close', () => { watchClients.delete(res) })
            return
          }

          if (!url.startsWith('/sample_data/')) return next()

          const relPath = url.slice('/sample_data/'.length)
          const filePath = path.join(sampleDataDir, relPath)
          if (!filePath.startsWith(sampleDataDir)) return next()

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath)
            const contentType = ext === '.svg' ? 'image/svg+xml'
              : ext === '.csv' ? 'text/csv; charset=utf-8'
              : ext === '.json' ? 'application/json'
              : 'application/octet-stream'
            res.setHeader('Content-Type', contentType)
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      },
    },
    {
      name: 'watch-editor-src',
      configureServer(server) {
        // Explicitly add the editor source directory to chokidar's watch list
        // so that changes to workspace package files trigger HMR.
        server.watcher.add(path.resolve(__dirname, '../editor/src'));
      },
    },
    tailwindcss(),
    react(),
  ],
  optimizeDeps: {
    exclude: ['bimdown-editor'],
  },
  server: {
    port: 5174,
    watch: {
      // FSEvents is broken for this directory — fall back to polling
      usePolling: true,
      interval: 500,
    },
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      'bimdown-editor/style.css': path.resolve(__dirname, '../editor/src/editor.css'),
      'bimdown-editor/src/i18n/en.json': path.resolve(__dirname, '../editor/src/i18n/en.json'),
      'bimdown-editor/src/i18n/zh.json': path.resolve(__dirname, '../editor/src/i18n/zh.json'),
      'bimdown-editor/data-sources': path.resolve(__dirname, '../editor/src/dataSources/index.ts'),
      'bimdown-editor': path.resolve(__dirname, '../editor/src/exports.ts'),
      '@': path.resolve(__dirname, './src'),
    },
  },
})
