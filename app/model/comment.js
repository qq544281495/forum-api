const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    __v: {type: Number, select: false},
    content: {type: String, required: true},
    commentator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {type: String, required: true, select: false},
    answer: {type: String, required: true, select: false},
    rootComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {timestamps: true},
);

module.exports = mongoose.model('Comment', commentSchema, 'comments');
