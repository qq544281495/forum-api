const Answer = require('../model/answer');
const Comment = require('../model/comment');

/**
 * 评论中间件
 */
class CommentMiddleware {
  /**
   * 判断问题和答案的一致性
   * @param {*} ctx
   * @param {*} next
   */
  async checkQuestionAndAnswer(ctx, next) {
    const questionId = ctx.params.questionId;
    const answerId = ctx.params.answerId;
    const answer = await Answer.findById(answerId).select('+question');
    if (answer.question.toString() !== questionId) {
      ctx.throw(404, '回答不存在');
    }
    await next();
  }
  /**
   * 判断评论和用户的一致性
   * @param {*} ctx
   * @param {*} next
   */
  async checkCommentAndUser(ctx, next) {
    const commentId = ctx.params.id;
    const userId = ctx.state.user._id;
    const comment = await Comment.findById(commentId);
    if (comment.commentator.toString() !== userId) {
      ctx.throw(403, '用户权限不足');
    }
    await next();
  }
}

module.exports = new CommentMiddleware();
