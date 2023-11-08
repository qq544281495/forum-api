const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  __v: {type: Number, select: false},
  username: {type: String, require: true}, // 用户名
  email: {type: String, require: true}, // 用户邮箱
  password: {type: String, require: true, select: false}, // 密码
  avatar_url: {type: String}, // 用户头像
  // 性别
  gander: {
    type: String,
    enum: ['male', 'female'],
    default: 'male',
    require: true,
  },
  handline: {type: String}, // 介绍
  locations: {type: [{type: String}], select: false}, // 居住地
  business: {type: String, select: false}, // 行业
  // 职业经历
  employments: {
    type: [
      {
        company: {type: String}, // 公司
        job: {type: String}, // 职位
      },
    ],
    select: false,
  },
  // 教育经历
  educations: {
    type: [
      {
        school: {type: String}, // 学校
        major: {type: String}, // 专业
        // 学历（小学 初中 高中 专科 本科 硕士 博士及以上）
        diploma: {type: Number, enum: [1, 2, 3, 4, 5, 6, 7]},
        entrance_year: {type: Number}, // 入学年份
        graduation_year: {type: Number}, // 毕业年份
      },
    ],
    select: false,
  },
  // 粉丝列表
  following: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    select: false,
  },
  // 用户创建时间
  createDate: {type: Date, default: Date.now(), select: false},
});

module.exports = mongoose.model('User', userSchema, 'users');
