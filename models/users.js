const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/blogs');


const userSchema = mongoose.Schema({
    username: { type: String, required: true},
    password: { type: String, required: true},
})

module.exports = mongoose.model('User',userSchema);
