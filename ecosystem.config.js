module.exports = {
    apps : [{
      name: 'BiglandBack',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: "production"
     },
     env_development: {
        NODE_ENV: "development"
     }
    }],
  }