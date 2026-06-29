// PM2 process configuration for the CberHunt Next.js app.
// Start with:  pm2 start ecosystem.config.js --env production
// The app serves both the frontend (cbersoftware.com.br) and its /api routes
// on port 3000; nginx reverse-proxies to it.
module.exports = {
  apps: [
    {
      name: 'cberhunt',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
