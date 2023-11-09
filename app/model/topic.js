const mongoose = require('mongoose');

const topicSchema = mongoose.Schema(
  {
    __v: {type: Number, select: false},
    name: {type: String, required: true},
    avatar_url: {type: String},
    introduction: {type: String, select: false},
    classify: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classify',
      required: true,
      select: false,
    },
  },
  {timestamps: true},
);

module.exports = mongoose.model('Topic', topicSchema, 'topics');
