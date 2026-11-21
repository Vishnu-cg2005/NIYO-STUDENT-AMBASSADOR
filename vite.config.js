import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleAiAssistantRequest } from './server/aiHandler.js';

export default defineConfig(({ mode }) => {
  // Load server-side environment variables from .env
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'vite-plugin-ai-assistant',
        configureServer(server) {
          server.middlewares.use('/api/ai-assistant', async (req, res) => {
            res.setHeader('Content-Type', 'application/json');

            if (req.method === 'GET') {
              const result = await handleAiAssistantRequest({ action: 'status' });
              res.statusCode = result.status;
              return res.end(JSON.stringify(result.data));
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', async () => {
                try {
                  const payload = JSON.parse(body || '{}');
                  const result = await handleAiAssistantRequest(payload);
                  res.statusCode = result.status;
                  res.end(JSON.stringify(result.data));
                } catch {
                  res.statusCode = 400;
                  res.end(JSON.stringify({ error: 'Invalid JSON request payload' }));
                }
              });
              return;
            }

            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          });
        },
      },
    ],
    base: './',
    server: {
      allowedHosts: true,
    },
  };
});
