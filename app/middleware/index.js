const jwt = require('koa-jwt');
const {secret} = require('../config/index');
const User = require('../model/user');
const Question = require('../model/question');

/**
 * 中间件
 */
class Middleware {
  // 用户鉴权（koa-jwt）
  auth = jwt({secret});

  /**
   * 判断操作是否为当前登录用户
   * @param {*} ctx
   * @param {*} next
   */
  async checkUser(ctx, next) {
    const id = ctx.params.id;
    const checkId = ctx.state.user._id;
    if (id !== checkId) {
      ctx.throw(403, '用户权限不足');
    }
    await next();
  }

  /**
   * 判断用户是否存在
   * @param {*} ctx
   * @param {*} next
   */
  async checkUserExist(ctx, next) {
    const userId = ctx.params.id;
    const user = await User.findById(userId);
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    await next();
  }
  /**
   * 判断是否为问题发起人
   * @param {*} ctx
   * @param {*} next
   */
  async checkUserQuestion(ctx, next) {
    const userId = ctx.state.user._id;
    const questionId = ctx.params.id;
    const question = await Question.findById(questionId).select('+questioner');
    if (!question) {
      ctx.throw(404, '问题不存在');
    }
    const {questioner} = question;
    if (userId !== questioner.toString()) {
      ctx.throw(403, '用户权限不足');
    }
    await next();
  }
}

module.exports = new Middleware();
