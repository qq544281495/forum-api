const Question = require('../model/question');
const Answer = require('../model/answer');
/**
 * 回答中间件
 */
class AnswerMiddleware {
  /**
   * 判断问题是否存在
   * @param {*} ctx
   * @param {*} next
   */
  async checkExistQuestion(ctx, next) {
    const questionId = ctx.params.questionId;
    const question = await Question.findById(questionId);
    if (!question) {
      ctx.throw(404, '问题不存在');
    }
    await next();
  }
  /**
   * 判断回答是否存在
   * @param {*} ctx
   * @param {*} next
   */
  async checkExistAnswer(ctx, next) {
    const answerId = ctx.params.id;
    const questionId = ctx.params.questionId;
    const answer = await Answer.findById(answerId).select('+question');
    if (!answer || answer.question.toString() !== questionId) {
      ctx.throw(404, '回答不存在');
    }
    await next();
  }
  /**
   * 判断当前用户是否为回答者
   * @param {*} ctx
   * @param {*} next
   */
  async checkAnswerer(ctx, next) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const answer = await Answer.findById(answerId);
    if (userId !== answer.answerer.toString()) {
      ctx.throw(403, '用户权限不足');
    }
    await next();
  }
}

module.exports = new AnswerMiddleware();
