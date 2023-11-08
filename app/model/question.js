const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  __v: {type: Number, select: false},
  title: {type: String, required: true},
  description: {type: String},
  questioner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    select: false,
  },
});

module.exports = mongoose.model('Question', questionSchema, 'questions');
