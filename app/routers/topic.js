const Router = require('koa-router');
const router = new Router({prefix: '/topic'});
const {koaBody} = require('koa-body');
const path = require('path');
// 控制器
const {
  getTopicList,
  getTopicDetail,
  createTopic,
  updateTopic,
  uploadTopicAvatar,
  followingList,
} = require('../controllers/topicController');
const {auth} = require('../middleware/index');

router.get('/', getTopicList);
router.get('/detail/:id', getTopicDetail);
router.post('/', auth, createTopic);
router.patch('/:id', updateTopic);
router.post(
  '/uploadAvatar/:id',
  auth,
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, '../public/topicAvatar'),
      keepExtensions: true,
    },
  }),
  uploadTopicAvatar,
);
router.get('/followingList/:id', followingList);

module.exports = router;
