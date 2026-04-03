/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "prerender",
      script: "server.js",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
