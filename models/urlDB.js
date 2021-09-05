const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url: String,
    short: Number
});

urlSchema.statics.findUrl = (url, cb) => {
    return Url.findOne({url: url}, cb);
};

module.exports = Url = mongoose.model('Url', urlSchema);

