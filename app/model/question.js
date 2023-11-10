const mongoose = require('mongoose');

const questionSchema = mongoose.Schema(
  {
    __v: {type: Number, select: false},
    title: {type: String, required: true},
    description: {type: String},
    questioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      select: false,
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
  },
  {timestamps: true},
);

module.exports = mongoose.model('Question', questionSchema, 'questions');
