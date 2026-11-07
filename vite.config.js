import { defineConfig } from 'vite';

function zohoEmailApiPlugin() {
  const DEFAULT_KEY = 'Zoho-enczapikey wSsVR61/rBSjWK57mjapI7w8zwsEVVmlQx8rigSl63X/G6vF9Mc/lEPLAACnHaQeQjM6RWcWpO94zRgC2zZcjtR8nA0ACCiF9mqRe1U4J3x17qnvhDzDV2tZlxWJLosJzgtomGZjFsAm+g==';

  return {
    name: 'zoho-email-api-plugin',
    configureServer(server) {
      // 1. Fetch live ZeptoMail / Zoho CPaaS delivery & bounce logs
      server.middlewares.use('/api/email-logs', async (req, res) => {
        try {
          const clientKey = req.headers['x-zoho-key'];
          const activeKey = (clientKey && typeof clientKey === 'string' && clientKey.trim().length > 10)
            ? clientKey.trim()
            : DEFAULT_KEY;
          const authHeader = activeKey.startsWith('Zoho-enczapikey')
            ? activeKey
            : `Zoho-enczapikey ${activeKey}`;

          const zohoRes = await fetch('https://cpaas.zoho.com/v1.1/email/logs', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': authHeader
            }
          });

          const zohoJson = await zohoRes.json().catch(() => ({}));
          res.statusCode = zohoRes.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(zohoJson));
        } catch (err) {
          console.error('[Zoho Logs Proxy Error]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Error fetching delivery logs' }));
        }
      });

      // 2. Dispatch email via Zoho CPaaS
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

            const activeKey = (apiKey && apiKey.trim().length > 10) ? apiKey.trim() : DEFAULT_KEY;
            const authHeader = activeKey.startsWith('Zoho-enczapikey')
              ? activeKey
              : `Zoho-enczapikey ${activeKey}`;

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
    host: '0.0.0.0',
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
