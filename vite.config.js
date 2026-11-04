import { defineConfig } from 'vite';

function zohoEmailApiPlugin() {
  return {
    name: 'zoho-email-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/send-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let rawBody = '';
        req.on('data', chunk => { rawBody += chunk; });
        req.on('end', async () => {
          try {
            const data = JSON.parse(rawBody || '{}');
            const { apiKey, from, to, subject, htmlbody, cc, bcc } = data;

            if (!apiKey || !apiKey.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                error: 'Missing Zoho API Key. Please enter your Zoho-enczapikey in the Admin Console.'
              }));
              return;
            }

            const cleanKey = apiKey.trim();
            const authHeader = cleanKey.startsWith('Zoho-enczapikey')
              ? cleanKey
              : `Zoho-enczapikey ${cleanKey}`;

            const payload = {
              from: from || { address: 'ceo@orvexi.rw', name: 'ORVEXI LTD' },
              to: to,
              subject: subject || 'ORVEXI Notification',
              htmlbody: htmlbody || '<p>ORVEXI Notification</p>'
            };

            if (cc && cc.length > 0) payload.cc = cc;
            if (bcc && bcc.length > 0) payload.bcc = bcc;

            const zohoRes = await fetch('https://cpaas.zoho.com/v1.1/email', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader
              },
              body: JSON.stringify(payload)
            });

            const zohoJson = await zohoRes.json().catch(() => ({}));
            res.statusCode = zohoRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(zohoJson));
          } catch (err) {
            console.error('[Zoho Proxy Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [zohoEmailApiPlugin()],
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
});
