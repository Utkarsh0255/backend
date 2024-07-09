const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/blogs');

const postSchema = mongoose.Schema({
    title : { type: String, required: true},
    content : { type: String, required: true},
    owner : {type: mongoose.Schema.Types.ObjectId ,ref: "User"},
    
})

module.exports = mongoose.model('Post',postSchema);