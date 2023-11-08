const mongoose = require('mongoose');

const classifySchema = mongoose.Schema({
  __v: {type: Number, select: false},
  name: {type: String, required: true},
  key: {type: String, required: true},
});

module.exports = mongoose.model('Classify', classifySchema, 'classifys');
