const Router = require('koa-router');
const router = new Router({prefix: '/users'});
const {koaBody} = require('koa-body');
const path = require('path');
// 控制器
const {
  createUser,
  userLogin,
  getUserList,
  getUserDetail,
  updateUser,
  deleteUser,
  uploadUserAvatar,
  follow,
  unfollow,
  followingList,
  followerList,
  followTopic,
  unfollowTopic,
} = require('../controllers/userController');
// 中间件
const {auth, checkUser, checkUserExist} = require('../middleware/index');

router.post('/', createUser);
router.post('/login', userLogin);
router.get('/', getUserList);
router.get('/detail/:id', getUserDetail);
router.patch('/:id', auth, checkUser, updateUser);
router.delete('/:id', auth, checkUser, deleteUser);
router.post(
  '/uploadAvatar/:id',
  auth,
  checkUser,
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../public/userAvatar'),
      keepExtensions: true,
    },
  }),
  uploadUserAvatar,
);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/unfollow/:id', auth, checkUserExist, unfollow);
router.get('/followingList/:id', followingList);
router.get('/followerList/:id', followerList);
router.put('/followTopic/:id', auth, followTopic);
router.delete('/unfollowTopic/:id', auth, unfollowTopic);

module.exports = router;
