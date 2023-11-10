const mongoose = require('mongoose');
const md5 = require('../utils/md5');

const userSchema = mongoose.Schema(
  {
    __v: {type: Number, select: false},
    // 用户名
    username: {type: String, require: true},
    // 用户邮箱
    email: {type: String, require: true},
    // 密码
    password: {
      type: String,
      require: true,
      select: false,
      set: (value) => md5(value), // 密码加密
    },
    // 用户头像
    avatar_url: {type: String},
    // 性别
    gander: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
      require: true,
    },
    // 介绍
    handline: {type: String},
    // 居住地
    locations: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Topic',
        },
      ],
      select: false,
    },
    // 行业
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      select: false,
    },
    // 职业经历
    employments: {
      type: [
        {
          // 公司
          company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
          },
          // 职位
          job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
          },
        },
      ],
      select: false,
    },
    // 教育经历
    educations: {
      type: [
        {
          // 学校
          school: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
          },
          // 专业
          major: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Topic',
          },
          // 学历（小学 初中 高中 专科 本科 硕士 博士及以上）
          diploma: {type: Number, enum: [1, 2, 3, 4, 5, 6, 7]},
          // 入学年份
          entrance_year: {type: Number},
          // 毕业年份
          graduation_year: {type: Number},
        },
      ],
      select: false,
    },
    // 关注用户
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      select: false,
    },
    // 关注话题
    followingTopic: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Topic',
        },
      ],
      select: false,
    },
    // 点赞回答
    likingAnswer: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Answer',
        },
      ],
      select: false,
    },
    // 点踩回答
    dislikingAnswer: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Answer',
        },
      ],
      select: false,
    },
    // 收藏回答
    collectAnswer: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Answer',
        },
      ],
      select: false,
    },
    // 用户创建时间
    createDate: {type: Date, default: Date.now(), select: false},
  },
  {timestamps: true},
);

module.exports = mongoose.model('User', userSchema, 'users');
