const Router = require('koa-router');
const router = new Router({prefix: '/question/:questionId/answer/:answerId'});
const {
  getCommentList,
  getSubcommentList,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const {auth} = require('../middleware/index');
const {
  checkQuestionAndAnswer,
  checkCommentAndUser,
} = require('../middleware/comment');

router.get('/', checkQuestionAndAnswer, getCommentList);
router.get('/subcomment/:id', checkQuestionAndAnswer, getSubcommentList);
router.post('/', auth, checkQuestionAndAnswer, createComment);
router.patch(
  '/comment/:id',
  auth,
  checkQuestionAndAnswer,
  checkCommentAndUser,
  updateComment,
);
router.delete(
  '/comment/:id',
  auth,
  checkQuestionAndAnswer,
  checkCommentAndUser,
  deleteComment,
);

module.exports = router;
