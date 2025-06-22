const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

exports.signup = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.create({ username, email, password });
        const token = createToken(user.userId);
        res.status(201).json({ token, user: { userId: user.userId, username, email } });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: 'User already exists or invalid data' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            return res.status(400).json({ error: 'Invalid credentials' });

        const token = createToken(user.userId);
        res.json({ token, user: { userId: user.userId, username: user.username, email } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};
