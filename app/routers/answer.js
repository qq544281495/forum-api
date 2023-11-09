const Router = require('koa-router');
const router = new Router({prefix: '/question/:questionId/answer'});
const {
  getAnswerList,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} = require('../controllers/answerController');
const {auth} = require('../middleware/index');
const {
  checkExistQuestion,
  checkExistAnswer,
  checkAnswerer,
} = require('../middleware/answer');

router.get('/', checkExistQuestion, getAnswerList);
router.post('/', auth, checkExistQuestion, createAnswer);
router.patch(
  '/:id',
  auth,
  checkExistQuestion,
  checkExistAnswer,
  checkAnswerer,
  updateAnswer,
);
router.delete(
  '/:id',
  auth,
  checkExistQuestion,
  checkExistAnswer,
  checkAnswerer,
  deleteAnswer,
);

module.exports = router;
