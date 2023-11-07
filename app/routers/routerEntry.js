const fs = require('fs');

module.exports = (app) => {
  const url = __dirname;
  fs.readdirSync(url).forEach((file) => {
    // 若为路由入口文件则返回
    if (file === 'routerEntry.js') return;
    const route = require(`./${file}`);
    app.use(route.routes()).use(route.allowedMethods());
  });
};
