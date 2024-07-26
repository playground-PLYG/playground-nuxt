module.exports = {
  apps: [
    {
      name: 'Playground',
      port: '3000',
      exec_mode: 'cluster',
      instances: '2',
      autostart: true,
      script: './.output/server/index.mjs',
      output: './logs/console.log',
      error: './logs/consoleError.log',
      env: {
        HOST: '0.0.0.0',
        PORT: 3000,
        NODE_ENV: 'production'
      }
    }
  ]
}
