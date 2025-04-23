const User = require('../models/user');

const registerUser = async (req, res) => {
    try {
        // Validate required fields
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Create user
        const user = await User.create(req.body);

        // Generate token with standardized payload
        const token = user.createJWT();

        // Secure response (never send password back)
        res.status(201).json({
            user: {
                name: user.name,
                email: user.email,
                userId: user._id
            },
            token
        });

    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: messages });
        }
        res.status(500).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = user.createJWT();

        // Response with user data
        res.json({
            user: {
                name: user.name,
                email: user.email,
                userId: user._id
            },
            token
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    registerUser: registerUser,
    loginUser: loginUser
};