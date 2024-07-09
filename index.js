const express = require("express");
const postModel = require("./models/blogs")
const userModel = require("./models/users")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();

app.use(bodyParser.json())

const secret = "abcdefg";

app.get("/",(req,res)=>{
    res.send("Backend of blog app");
})

app.post('/register', async (req, res) => {
    const userData = new userModel({
        username: req.body.username,
        password: await bcrypt.hash(req.body.password, 10)
    })
    const savedData = await userData.save();
    res.send(savedData);
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const user = await userModel.findOne({ username });
    if (!user) return res.status(400).send("Invalid Username");
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
    res.send(token);
})

const authenticate = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.send("please login ");
    }
    try {
        const user = jwt.verify(token, secret);
        req.user = user;
        next();

    }
    catch (error) {
        res.status(400).send("Invalid Token");
    }
}

app.post('/create', authenticate, async (req, res) => {
    const blogData = new postModel({
        title: req.body.title,
        content: req.body.content,
        owner: req.user.userId,
        keywords: req.body.keywords
    })
    const savedblog = await blogData.save();
    res.send(savedblog);
})

app.get('/myblogs', authenticate, async (req, res) => {
    const blogs = await postModel.find({ "owner": req.user.userId });
    res.send(blogs);
})

app.get('/blog/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    try {

        const blog = await postModel.findOne({ _id });
        res.send(blog);
    }
    catch (err) {
        res.send("Not Found");
    }
})


app.put('/blog/update/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    try {
        const updatedBlog = await postModel.findOneAndUpdate({ _id }, { $set: { title: req.body.title, content: req.body.content } }, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }
        res.send(updatedBlog);
    }
    catch (error) {
        res.status(500);
    }
})
app.delete('/blog/delete/:id', authenticate, async (req, res) => {
    const _id = req.params.id;
    try {
        const deletedBlog = await postModel.findOneAndDelete({ _id });
        if(!deletedBlog){
            return res.send("Blog not found");
        }
        res.send("Blog deleted");
    }
    catch (error) {
        res.status(500);
    }
})

app.listen('3001', () => {
    console.log("Server is listening on port 3001");
})