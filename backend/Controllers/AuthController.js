const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");

// Cookie settings
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

const signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (user) {
            return res.status(409).json({ message: 'User already exists, you can login', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ firstName, lastName, email, password: hashedPassword });
        
        await newUser.save();

        res.status(201).json({
            message: "Signup successful",
            success: true
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Auth failed: email or password is incorrect';

        if (!user) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ message: errorMsg, success: false });
        }

        const token = jwt.sign(
            { email: user.email, _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, COOKIE_OPTIONS);

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                email,
                firstName: user.firstName,
                lastName: user.lastName,
                userId: user._id
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: err.message
        });
    }
}

const logout = (req, res) => {
    // Clear the auth cookie
    res.clearCookie('auth_token');
    res.status(200).json({
        message: "Logout successful",
        success: true
    });
}

const getProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await UserModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        
        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error("Profile fetch error:", err);
        res.status(500).json({
            message: "Error fetching profile",
            success: false,
            error: err.message
        });
    }
}

module.exports = {
    signup,
    login,
    logout,
    getProfile
};
