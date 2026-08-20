import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Serve /api/oracle during `npm run dev` using the *same* core the Vercel
// function uses, so local behaviour matches production without the Vercel CLI.
// The key is read server-side only — never exposed through import.meta.env.
function oracleDevApi(): Plugin {
  return {
    name: 'oracle-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/oracle', async (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') return send(405, { error: 'method not allowed' })
        if (!process.env.DEEPSEEK_API_KEY) return send(503, { error: 'no key configured' })

        try {
          const raw = await new Promise<string>((resolve, reject) => {
            let data = ''
            req.on('data', (c: Buffer) => { data += c })
            req.on('end', () => resolve(data))
            req.on('error', reject)
          })
          const body = raw ? JSON.parse(raw) : {}
          // ssrLoadModule transforms the TS on the fly, so there's no build step.
          const mod = await server.ssrLoadModule('/api/_core.ts')
          const picks = await mod.runOracle(
            typeof body.text === 'string' ? body.text : '',
            Array.isArray(body.tags) ? body.tags : [],
          )
          send(200, { picks })
        } catch (err) {
          server.config.logger.error(
            `[oracle] ${err instanceof Error ? err.message : String(err)}`,
          )
          send(502, { error: 'oracle unavailable' })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Make DEEPSEEK_API_KEY from .env visible to the dev middleware (server
  // side). It is NOT VITE_-prefixed, so Vite will not inline it into the
  // client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.DEEPSEEK_API_KEY) process.env.DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY

  return {
    plugins: [react(), oracleDevApi()],
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
  }
})
