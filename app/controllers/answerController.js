const Answer = require('../model/answer');

/**
 * 回答API控制器
 */
class AnswerController {
  /**
   * 获取问题回答列表
   * @param {*} ctx
   */
  async getAnswerList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    keyword = new RegExp(keyword);
    const questionId = ctx.params.questionId;
    const answer = await Answer.find({content: keyword, question: questionId})
      .populate('answerer')
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = answer;
  }
  /**
   * 创建问题回答
   * @param {*} ctx
   */
  async createAnswer(ctx) {
    ctx.verifyParams({
      content: {type: 'string', required: true},
    });
    const answerer = ctx.state.user._id;
    const question = ctx.params.questionId;
    const {content} = ctx.request.body;
    const params = {
      content,
      answerer,
      question,
    };
    const answer = await new Answer(params).save();
    ctx.body = answer;
  }
  /**
   * 更新回答
   * @param {*} ctx
   */
  async updateAnswer(ctx) {
    ctx.verifyParams({
      content: {type: 'string', required: true},
    });
    const answerId = ctx.params.id;
    const {content} = ctx.request.body;
    const answer = await Answer.findByIdAndUpdate(answerId, {content});
    ctx.body = answer;
  }
  /**
   * 删除回答
   * @param {*} ctx
   */
  async deleteAnswer(ctx) {
    const answerId = ctx.params.id;
    await Answer.findByIdAndDelete(answerId);
    ctx.status = 204;
  }
}

module.exports = new AnswerController();
