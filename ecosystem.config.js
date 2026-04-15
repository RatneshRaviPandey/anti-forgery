module.exports = {
  apps: [{
    name: 'infometa',
    cwd: 'C:/MyData/Business/NewProjects/anti-forgery/infometa',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // Restart on crash
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    // Memory limit — restart if exceeds 1GB
    max_memory_restart: '1G',
    // Logs
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/infometa-error.log',
    out_file: './logs/infometa-out.log',
    merge_logs: true,
    // Watch (disabled in production)
    watch: false,
  }],
};
