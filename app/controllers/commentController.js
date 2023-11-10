const Comment = require('../model/comment');

/**
 * 评论API控制器
 */
class CommentController {
  /**
   * 获取一级评论列表
   * @param {*} ctx
   */
  async getCommentList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    keyword = new RegExp(keyword);
    const {questionId, answerId} = ctx.params;
    const params = {
      content: keyword,
      question: questionId,
      answer: answerId,
      rootComment: {$exists: false},
    };
    const comment = await Comment.find(params)
      .populate('commentator')
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = comment;
  }
  /**
   * 获取子评论
   * @param {*} ctx
   */
  async getSubcommentList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    keyword = new RegExp(keyword);
    const {questionId, answerId, id} = ctx.params;
    const params = {
      content: keyword,
      question: questionId,
      answer: answerId,
      rootComment: {$exists: true, $eq: id},
    };
    const comment = await Comment.find(params)
      .populate('commentator rootComment replyTo')
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = comment;
  }
  /**
   * 创建评论
   * @param {*} ctx
   */
  async createComment(ctx) {
    ctx.verifyParams({
      content: {type: 'string', required: true},
      rootComment: {type: 'string', required: false},
      replyTo: {type: 'string', required: false},
    });
    const commentator = ctx.state.user._id;
    const {questionId, answerId} = ctx.params;
    const params = {
      commentator,
      question: questionId,
      answer: answerId,
      ...ctx.request.body,
    };
    const comment = await new Comment(params).save();
    ctx.body = comment;
  }
  /**
   * 更新评论
   * @param {*} ctx
   */
  async updateComment(ctx) {
    ctx.verifyParams({
      content: {type: 'string', required: true},
    });
    const commentId = ctx.params.id;
    const {content} = ctx.request.body;
    const comment = await Comment.findByIdAndUpdate(commentId, {content});
    ctx.body = comment;
  }
  /**
   * 删除评论
   * @param {*} ctx
   */
  async deleteComment(ctx) {
    const commentId = ctx.params.id;
    await Comment.findByIdAndDelete(commentId);
    ctx.status = 204;
  }
}

module.exports = new CommentController();
