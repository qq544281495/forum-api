const User = require('../model/user');
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
    const userList = await User.find({username: new RegExp(keyword)})
      .limit(pageSize)
      .skip((pageNumber - 1) * pageSize);
    ctx.body = userList;
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
    const userId = ctx.params.id;
    const user = await User.findById(userId)
      .select('+following')
      .populate('following');
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
    const userId = ctx.params.id;
    const user = await User.find({following: userId});
    ctx.body = user;
  }
}

module.exports = new UserController();
