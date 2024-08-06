module.exports = {
  apps: [
    {
      name: 'Playground',
      port: '3000',
      exec_mode: 'cluster',
      instances: '2',
      autostart: true,
      script: './.output/server/index.mjs',
      node_args: ['-r', 'pinpoint-node-agent'],
      env: {
        HOST: '0.0.0.0',
        PORT: 3000,
        NODE_ENV: 'production',
        ENV_TEXT: '${NODE_APP_INSTANCE}',
        PINPOINT_AGENT_ID: 'nuxt',
        PINPOINT_APPLICATION_NAME: 'playground-web'
      }
    }
  ]
}
