module.exports = {
  apps: [
    {
      name: 'toosila-api',
      cwd: './server',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '500M',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
    }
  ]
};
