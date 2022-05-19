module.exports = {
    apps : [{
      name: 'BiglandBack',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
    }],
  }