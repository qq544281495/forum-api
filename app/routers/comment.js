const Router = require('koa-router');
const router = new Router({prefix: '/question/:questionId/answer/:answerId'});
const {
  getCommentList,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentController');
const {auth} = require('../middleware/index');

router.get('/', getCommentList);
router.post('/', auth, createComment);
router.patch('/:id', auth, updateComment);
router.delete('/:id', auth, deleteComment);

module.exports = router;
