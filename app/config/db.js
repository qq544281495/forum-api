const mongoose = require('mongoose');
mongoose
  .connect('mongodb://127.0.0.1:27017/forum')
  .catch((error) => console.log(`数据库连接失败：${error}`));

const db = mongoose.connection;
db.on('error', (error) => console.log(`数据库错误：${error}`));
db.on('open', () => console.log('数据库连接成功'));
