import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const incidents = [
  {
    id: 101,
    incidentId: 101,
    title: 'Flood response volunteers needed in Plymouth Barbican',
    description: 'Help residents affected by local flooding with supplies, check-ins, and safe route guidance.',
    type: 'Flood',
    latitude: 50.3686,
    longitude: -4.1342,
    priority: 'critical',
    status: 'open',
    volunteersHelped: 5,
  },
  {
    id: 102,
    incidentId: 102,
    title: 'Community food support at Devonport aid point',
    description: 'Support food parcel sorting and distribution for families and rough sleepers near Devonport.',
    type: 'Relief',
    latitude: 50.3781,
    longitude: -4.1714,
    priority: 'high',
    status: 'open',
    volunteersHelped: 8,
  },
  {
    id: 103,
    incidentId: 103,
    title: 'Storm damage reporting around Mutley Plain',
    description: 'Check reported storm damage, collect photos, and share updates with the coordinator team.',
    type: 'Storm',
    latitude: 50.3842,
    longitude: -4.1359,
    priority: 'normal',
    status: 'open',
    volunteersHelped: 6,
  },
  {
    id: 104,
    incidentId: 104,
    title: 'Shelter support volunteers at city centre',
    description: 'Assist the temporary shelter team with welcome desk support, supplies, and resident guidance.',
    type: 'Shelter',
    latitude: 50.3715,
    longitude: -4.1427,
    priority: 'low',
    status: 'open',
    volunteersHelped: 9,
  },
];

function sendJson(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function plymouthApiPlugin() {
  return {
    name: 'plymouth-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const method = req.method || 'GET';
        const url = req.url || '/';

        if (method === 'GET' && url === '/incidents') {
          sendJson(res, incidents);
          return;
        }

        const incidentMatch = url.match(/^\/incidents\/(\d+)$/);
        if (method === 'GET' && incidentMatch) {
          const incident = incidents.find(item => item.id === Number(incidentMatch[1]));
          sendJson(res, incident || { message: 'Incident not found.' }, incident ? 200 : 404);
          return;
        }

        const joinMatch = url.match(/^\/incidents\/(\d+)\/join$/);
        if (method === 'POST' && joinMatch) {
          const incident = incidents.find(item => item.id === Number(joinMatch[1]));

          if (!incident) {
            sendJson(res, { success: false, message: 'Incident not found.' }, 404);
            return;
          }

          incident.volunteersHelped += 1;
          sendJson(res, {
            success: true,
            message: 'Volunteer joined incident.',
            incident,
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), plymouthApiPlugin()],
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  }
});
