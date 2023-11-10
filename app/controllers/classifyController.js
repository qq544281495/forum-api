const Classify = require('../model/classify');
const Topic = require('../model/topic');

/**
 * 分类API控制器
 */
class ClassifyController {
  /**
   * 获取分类列表
   * @param {*} ctx
   */
  async getClassifyList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const classify = await Classify.find({name: new RegExp(keyword)})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = classify;
  }
  /**
   * 创建分类
   * @param {*} ctx
   */
  async createClassify(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: true},
      key: {type: 'string', required: true},
    });
    const {name, key} = ctx.request.body;
    const existsClassify = await Classify.findOne({name, key});
    if (existsClassify) {
      ctx.throw(409, '分类已存在');
    }
    const classifyParams = ctx.request.body;
    const classify = await new Classify(classifyParams).save();
    ctx.body = classify;
  }
  /**
   * 更新分类
   * @param {*} ctx
   */
  async updateClassify(ctx) {
    ctx.verifyParams({
      name: {type: 'string', required: false},
      key: {type: 'string', required: false},
    });
    const classifyId = ctx.params.id;
    const classifyParams = ctx.request.body;
    const classify = await Classify.findByIdAndUpdate(
      classifyId,
      classifyParams,
    );
    if (!classify) {
      ctx.throw(404, '分类不存在');
    }
    ctx.body = classify;
  }
  /**
   * 获取分类话题
   * @param {*} ctx
   */
  async getTopicList(ctx) {
    const classifyId = ctx.params.id;
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const topic = await Topic.find({classify: classifyId})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = topic;
  }
}

module.exports = new ClassifyController();
