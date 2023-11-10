const Question = require('../model/question');

/**
 * 问题API控制器
 */
class QuestionController {
  /**
   * 创建问题
   * @param {*} ctx
   */
  async createQuestion(ctx) {
    ctx.verifyParams({
      title: {type: 'string', required: true},
      description: {type: 'string', required: false},
      topic: {type: 'array', itemType: 'string', required: false},
    });
    const questioner = ctx.state.user._id;
    const params = {...ctx.request.body, questioner};
    const question = await new Question(params).save();
    ctx.body = question;
  }
  /**
   * 获取问题列表
   * @param {*} ctx
   */
  async getQuestionList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    keyword = new RegExp(keyword);
    const question = await Question.find({
      $or: [{title: keyword}, {description: keyword}],
    })
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = question;
  }
  /**
   * 获取问题详情
   * @param {*} ctx
   */
  async getQuestionDetail(ctx) {
    const questionId = ctx.params.id;
    const question = await Question.findById(questionId)
      .select('+topic')
      .populate('questioner topic');
    if (!question) {
      ctx.throw(404, '问题不存在');
    }
    ctx.body = question;
  }
  /**
   * 更新问题
   * @param {*} ctx
   */
  async updateQuestion(ctx) {
    ctx.verifyParams({
      title: {type: 'string', required: false},
      description: {type: 'string', required: false},
      topic: {type: 'array', itemType: 'string', required: false},
    });
    const questionId = ctx.params.id;
    const questionParams = ctx.request.body;
    const question = await Question.findByIdAndUpdate(
      questionId,
      questionParams,
    );
    ctx.body = question;
  }
  /**
   * 删除问题
   * @param {*} ctx
   */
  async deleteQuestion(ctx) {
    const questionId = ctx.params.id;
    await Question.findByIdAndDelete(questionId);
    ctx.status = 204;
  }
}

module.exports = new QuestionController();
