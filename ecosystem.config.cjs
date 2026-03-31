module.exports = {
  apps: [
    {
      name: "encarparse",
      cwd: "/var/www/encarparse.ozzy1986.com",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
