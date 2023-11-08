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
} = require('../controllers/userController');
// 中间件
const {auth, checkUser} = require('../middleware/index');

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

module.exports = router;
