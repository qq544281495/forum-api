const User = require('../model/user');
const Topic = require('../model/topic');
const Question = require('../model/question');
const Answer = require('../model/answer');
const jsonwebtoken = require('jsonwebtoken');
const {secret} = require('../config/index');
const path = require('path');
const {deleteUserAvatar} = require('../utils/common');

/**
 * 用户API控制器
 */
class UserController {
  /**
   * 注册用户
   * @param {*} ctx
   */
  async createUser(ctx) {
    ctx.verifyParams({
      username: {type: 'string', required: true},
      email: {type: 'string', required: true},
      password: {type: 'string', required: true},
      gander: {type: 'string', required: true},
    });
    const {email} = ctx.request.body;
    const verifyEmail = await User.findOne({email});
    if (verifyEmail) {
      ctx.throw(409, '该邮箱已注册');
    }
    const userParams = ctx.request.body;
    const user = await new User(userParams).save();
    ctx.body = user;
  }
  /**
   * 用户登录
   * @param {*} ctx
   */
  async userLogin(ctx) {
    ctx.verifyParams({
      email: {type: 'string', required: true},
      password: {type: 'string', required: true},
    });
    const userParams = ctx.request.body;
    const user = await User.findOne(userParams);
    if (!user) {
      ctx.throw(401, '邮箱或密码错误');
    }
    const {_id, username, email} = user;
    const signParams = {_id, username, email};
    const token = jsonwebtoken.sign(signParams, secret, {expiresIn: '1d'});
    ctx.body = {_id, username, email, token};
  }
  /**
   * 获取用户列表
   * @param {*} ctx
   */
  async getUserList(ctx) {
    let {pageNumber = 1, pageSize = 10, keyword = ''} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const user = await User.find({username: new RegExp(keyword)})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = user;
  }
  /**
   * 获取用户资料
   * @param {*} ctx
   */
  async getUserDetail(ctx) {
    const id = ctx.params.id;
    const select = [
      '+locations',
      '+business',
      '+employments',
      '+educations',
      '+following',
      '+createDate',
    ];
    const populate = [
      'locations',
      'business',
      'employments.company',
      'employments.job',
      'educations.school',
      'educations.major',
      'following',
    ];
    const selectParams = select.join(' ');
    const populateParams = populate.join(' ');
    const user = await User.findById(id)
      .select(selectParams)
      .populate(populateParams);
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user;
  }
  /**
   * 更新用户信息
   * @param {*} ctx
   */
  async updateUser(ctx) {
    ctx.verifyParams({
      username: {type: 'string', required: false},
      email: {type: 'string', required: false},
      password: {type: 'string', required: false},
      avatar_url: {type: 'string', required: false},
      gander: {type: 'string', required: false},
      handline: {type: 'string', required: false},
      locations: {type: 'array', itemType: 'string', required: false},
      business: {type: 'string', required: false},
      employments: {type: 'array', itemType: 'object', required: false},
      educations: {type: 'array', itemType: 'object', required: false},
    });
    const id = ctx.params.id;
    const userParams = ctx.request.body;
    const user = await User.findByIdAndUpdate(id, userParams);
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user;
  }
  /**
   * 删除用户
   * @param {*} ctx
   */
  async deleteUser(ctx) {
    try {
      const id = ctx.params.id;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        ctx.throw(404, '用户不存在');
      }
      const {avatar_url} = user;
      deleteUserAvatar(avatar_url, ctx.origin);
      ctx.status = 204;
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
  /**
   * 更新用户头像
   * @param {*} ctx
   */
  async uploadUserAvatar(ctx) {
    try {
      const id = ctx.params.id;
      const existsUser = await User.findById(id);
      if (!existsUser) {
        ctx.throw(404, '用户不存在');
      }
      const {avatar_url} = existsUser;
      deleteUserAvatar(avatar_url, ctx.origin);
      const file = ctx.request.files.file;
      const filePath = file.filepath;
      const basename = path.basename(filePath);
      const avatarPath = `${ctx.origin}/userAvatar/${basename}`;
      await User.findByIdAndUpdate(id, {avatar_url: avatarPath});
      ctx.body = {
        message: '头像上传成功',
        avatar_url: avatarPath,
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  }
  /**
   * 关注用户
   * @param {*} ctx
   */
  async follow(ctx) {
    const userId = ctx.state.user._id;
    const followId = ctx.params.id;
    if (userId === followId) {
      ctx.throw(409, '无法关注该用户');
    }
    const user = await User.findById(userId).select('+following');
    const followList = user.following.map((item) => item.toString());
    if (!followList.includes(followId)) {
      user.following.push(followId);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 取消关注
   * @param {*} ctx
   */
  async unfollow(ctx) {
    const userId = ctx.state.user._id;
    const unfollowId = ctx.params.id;
    if (userId === unfollowId) {
      ctx.throw(409, '无法取关该用户');
    }
    const user = await User.findById(userId).select('+following');
    const followList = user.following.map((item) => item.toString());
    const index = followList.indexOf(unfollowId);
    if (index > -1) {
      user.following.splice(index, 1);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 获取用户关注列表
   * @param {*} ctx
   */
  async followingList(ctx) {
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const userId = ctx.params.id;
    const user = await User.findById(userId)
      .select('+following')
      .populate({
        path: 'following',
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
      });
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.following;
  }
  /**
   * 获取用户粉丝列表
   * @param {*} ctx
   */
  async followerList(ctx) {
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const userId = ctx.params.id;
    const user = await User.find({following: userId})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = user;
  }
  /**
   * 关注话题
   * @param {*} ctx
   */
  async followTopic(ctx) {
    const userId = ctx.state.user._id;
    const topicId = ctx.params.id;
    const topic = await Topic.findById(topicId);
    if (!topic) {
      ctx.throw(404, '话题不存在');
    }
    const user = await User.findById(userId).select('+followingTopic');
    const topicList = user.followingTopic.map((item) => item.toString());
    if (!topicList.includes(topicId)) {
      user.followingTopic.push(topicId);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 取消关注话题
   * @param {*} ctx
   */
  async unfollowTopic(ctx) {
    const userId = ctx.state.user._id;
    const topicId = ctx.params.id;
    const user = await User.findById(userId).select('+followingTopic');
    const topicList = user.followingTopic.map((item) => item.toString());
    const index = topicList.indexOf(topicId);
    if (index > -1) {
      user.followingTopic.splice(index, 1);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 获取用户关注话题列表
   * @param {*} ctx
   */
  async getFollowTopicList(ctx) {
    const userId = ctx.params.id;
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const user = await User.findById(userId)
      .select('+followingTopic')
      .populate({
        path: 'followingTopic',
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
      });
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.followingTopic;
  }
  /**
   * 获取用户提问列表
   * @param {*} ctx
   */
  async getUserQuestion(ctx) {
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const userId = ctx.params.id;
    const user = await User.findById(userId);
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    const question = await Question.find({questioner: userId})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = question;
  }
  /**
   * 点赞回答
   * @param {*} ctx
   * @param {*} next
   */
  async likingAnswer(ctx, next) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+likingAnswer');
    const likingList = user.likingAnswer.map((item) => item.toString());
    if (!likingList.includes(answerId)) {
      user.likingAnswer.push(answerId);
      user.save();
      await Answer.findByIdAndUpdate(answerId, {$inc: {upvote: 1}});
    }
    ctx.status = 204;
    await next();
  }
  /**
   * 取消点赞
   * @param {*} ctx
   */
  async unlikingAnswer(ctx) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+likingAnswer');
    const likingList = user.likingAnswer.map((item) => item.toString());
    const index = likingList.indexOf(answerId);
    if (index > -1) {
      user.likingAnswer.splice(index, 1);
      user.save();
      await Answer.findByIdAndUpdate(answerId, {$inc: {upvote: -1}});
    }
    ctx.status = 204;
  }

  /**
   * 点踩回答
   * @param {*} ctx
   * @param {*} next
   */
  async dislikingAnswer(ctx, next) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+dislikingAnswer');
    const dislikingList = user.dislikingAnswer.map((item) => item.toString());
    if (!dislikingList.includes(answerId)) {
      user.dislikingAnswer.push(answerId);
      user.save();
    }
    ctx.status = 204;
    await next();
  }
  /**
   * 取消点踩
   * @param {*} ctx
   */
  async undislikingAnswer(ctx) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+dislikingAnswer');
    const dislikingList = user.dislikingAnswer.map((item) => item.toString());
    const index = dislikingList.indexOf(answerId);
    if (index > -1) {
      user.dislikingAnswer.splice(index, 1);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 获取用户点赞回答列表
   * @param {*} ctx
   */
  async getLikingAnswerList(ctx) {
    const userId = ctx.params.id;
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const user = await User.findById(userId)
      .select('+likingAnswer')
      .populate({
        path: 'likingAnswer',
        select: '+question',
        populate: {path: 'answerer question'},
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
      });
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.likingAnswer;
  }
  /**
   * 获取用户点踩回答列表
   * @param {*} ctx
   */
  async getDislikingAnswerList(ctx) {
    const userId = ctx.params.id;
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const user = await User.findById(userId)
      .select('+dislikingAnswer')
      .populate({
        path: 'dislikingAnswer',
        select: '+question',
        populate: {path: 'answerer question'},
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
      });
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.dislikingAnswer;
  }
  /**
   * 收藏回答
   * @param {*} ctx
   */
  async collectAnswer(ctx) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+collectAnswer');
    const collectList = user.collectAnswer.map((item) => item.toString());
    if (!collectList.includes(answerId)) {
      user.collectAnswer.push(answerId);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 取消收藏
   * @param {*} ctx
   */
  async uncollectAnswer(ctx) {
    const userId = ctx.state.user._id;
    const answerId = ctx.params.id;
    const user = await User.findById(userId).select('+collectAnswer');
    const collectList = user.collectAnswer.map((item) => item.toString());
    const index = collectList.indexOf(answerId);
    if (index > -1) {
      user.collectAnswer.splice(index, 1);
      user.save();
    }
    ctx.status = 204;
  }
  /**
   * 获取收藏回答列表
   * @param {*} ctx
   */
  async getCollectAnswerList(ctx) {
    const userId = ctx.params.id;
    let {pageNumber = 1, pageSize = 10} = ctx.query;
    pageNumber = Math.max(pageNumber * 1, 1);
    pageSize = Math.max(pageSize * 1, 1);
    const user = await User.findById(userId)
      .select('+collectAnswer')
      .populate({
        path: 'collectAnswer',
        select: '+question',
        populate: {path: 'answerer question'},
        limit: pageSize,
        skip: (pageNumber - 1) * pageSize,
      });
    if (!user) {
      ctx.throw(404, '用户不存在');
    }
    ctx.body = user.collectAnswer;
  }
}

module.exports = new UserController();
