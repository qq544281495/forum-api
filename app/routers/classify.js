const Router = require('koa-router');
const router = new Router({prefix: '/classify'});
const {
  getClassifyList,
  createClassify,
  updateClassify,
} = require('../controllers/classifyController');
const {auth} = require('../middleware/index');

router.get('/', getClassifyList);
router.post('/', auth, createClassify);
router.patch('/:id', auth, updateClassify);

module.exports = router;
