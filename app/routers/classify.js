const Router = require('koa-router');
const router = new Router({prefix: '/classify'});
const {
  getClassifyList,
  createClassify,
  updateClassify,
  getTopicList,
} = require('../controllers/classifyController');
const {auth} = require('../middleware/index');

router.get('/', getClassifyList);
router.post('/', auth, createClassify);
router.patch('/:id', auth, updateClassify);
router.get('/getTopicList/:id', getTopicList);

module.exports = router;
