const Topic = require('../model/topic');
const path = require('path');
const {deleteUserAvatar} = require('../utils/common');
/**
 * 话题API控制器
 */
class TopicController {
  /**
   * 获取话题列表
   * @param {*} ctx
   */
  async getTopicList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const topic = await Topic.find({name: new RegExp(keyword)})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = topic;
  }
  /**
   * 获取话题详情
   * @param {*} ctx
   */
  async getTopicDetail(ctx) {
    const topicId = ctx.params.id;
    const topic = await Topic.findById(topicId).select('+introduction');
    ctx.body = topic;
  }
  /**
   * 创建话题
   * @param {*} ctx
   */
  async createTopic(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      introduction: {type: 'string', required: false},
    });
    const topicParams = ctx.request.body;
    const topic = await new Topic(topicParams).save();
    ctx.body = topic;
  }
  /**
   * 更新话题
   * @param {*} ctx
   */
  async updateTopic(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: false},
      introduction: {type: 'string', required: false},
    });
    const topicId = ctx.params.id;
    const topicParams = ctx.request.body;
    const topic = await Topic.findByIdAndUpdate(topicId, topicParams);
    ctx.body = topic;
  }
  /**
   * 更新话题图标
   * @param {*} ctx
   */
  async uploadTopicAvatar(ctx) {
    try {
      const id = ctx.params.id;
      const existsTopic = await Topic.findById(id);
      if (!existsTopic) {
        ctx.throw(404, '话题不存在');
      }
      const {avatar_url} = existsTopic;
      deleteUserAvatar(avatar_url, ctx.origin);
      const file = ctx.request.files.file;
      const filePath = file.filepath;
      const basename = path.basename(filePath);
      const avatarPath = `${ctx.origin}/topicAvatar/${basename}`;
      await Topic.findByIdAndUpdate(id, {avatar_url: avatarPath});
      ctx.body = {
        message: '话题图标上传成功',
        avatar_url: avatarPath,
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
}

module.exports = new TopicController();
