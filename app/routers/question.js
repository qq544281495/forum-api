const Router = require('koa-router');
const router = new Router({prefix: '/question'});
const {
  getQuestionList,
  getQuestionDetail,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../controllers/questionController');
const {auth, checkUserQuestion} = require('../middleware/index');

router.get('/', getQuestionList);
router.get('/detail/:id', getQuestionDetail);
router.post('/', auth, createQuestion);
router.patch('/:id', auth, checkUserQuestion, updateQuestion);
router.delete('/:id', auth, checkUserQuestion, deleteQuestion);

module.exports = router;
