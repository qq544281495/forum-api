const mongoose = require('mongoose');

const answerSchema = mongoose.Schema({
  __v: {type: Number, select: false},
  content: {type: String, required: true},
  answerer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    select: false,
  },
  upvote: {type: Number, required: true, default: 0},
});

module.exports = mongoose.model('Answer', answerSchema, 'answers');
