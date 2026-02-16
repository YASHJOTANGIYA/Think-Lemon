const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Generate token
        const token = generateToken(user._id);

        // Send welcome email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Welcome to PrintLok Studio!',
                message: `<h1>Welcome, ${user.name}!</h1><p>Thank you for registering with PrintLok Studio. We are excited to have you on board.</p>`
            });
        } catch (emailError) {
            console.error('Error sending welcome email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);



        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// @route   POST /api/auth/google
// @desc    Login with Google
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });
        let isNewUser = false;

        if (!user) {
            // Create new user
            user = await User.create({
                name,
                email,
                password: Math.random().toString(36).slice(-8), // Random password
                role: 'user'
            });
            isNewUser = true;
        }

        const jwtToken = generateToken(user._id);

        // Send email only if it's a new user
        if (isNewUser) {
            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Welcome to PrintLok Studio!',
                    message: `<h1>Welcome, ${user.name}!</h1><p>Thank you for registering with PrintLok Studio via Google.</p>`
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                },
                token: jwtToken
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error with Google login',
            error: error.message
        });
    }
});

module.exports = router;
