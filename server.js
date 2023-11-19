//server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB 
mongoose.connect('mongodb://localhost/react_node_authentication', { useNewUrlParser: true, useUnifiedTopology: true});

// Create a user schema
const userSchema = new mongoose.Schema({
    username: String,
    passwords: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.json());

// Signup endpoint
app.post('/api/signup', async (req, res) =>{
    try {
        const { username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

// Signin endpoint
app.post('/api/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if(!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password'});
        }

        const token = jwt.sign({ userId: user._id }, 'your-secrete-key');
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})