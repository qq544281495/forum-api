const Koa = require('koa');
const {koaBody} = require('koa-body');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const path = require('path');
const koaStatic = require('koa-static');
const app = new Koa();
const routerEntry = require('./routers/routerEntry');
// 连接数据库
require('./config/db');

app.use(koaStatic(path.join(__dirname, 'public')));
app.use(
  error({
    postFormat: (error, {stack, ...result}) => {
      const errorMessage =
        process.env.NODE_ENV === 'production' ? result : {result, stack};
      return errorMessage;
    },
  }),
);
app.use(koaBody());
app.use(parameter(app));
routerEntry(app);
app.listen(3000, () => console.log('服务已在3000端口启动...'));
