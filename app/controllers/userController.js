const User = require('../model/user');
const jsonwebtoken = require('jsonwebtoken');
const {secret} = require('../config/index');
const operate = require('../utils/operate');
const path = require('path');

/**
 * 删除用户头像
 * @param {string} url
 * @param {string} origin
 */
async function deleteUserAvatar(url, origin) {
  if (!url) return;
  const lastPath = url.substring(origin.length);
  // 获取用户头像绝对路径
  const avatarUrl = path.join(__dirname, `../public${lastPath}`);
  const existsAvatar = await operate.exists(avatarUrl);
  if (existsAvatar) {
    await operate.delete(avatarUrl);
  }
}
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
    const userList = await User.find();
    ctx.body = userList;
  }
  /**
   * 获取用户资料
   * @param {*} ctx
   */
  async getUserDetail(ctx) {
    const id = ctx.params.id;
    const params = [
      '+locations',
      '+business',
      '+employments',
      '+educations',
      '+createDate',
    ];
    const selectParams = params.join(' ');
    const user = await User.findById(id).select(selectParams);
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
}

module.exports = new UserController();