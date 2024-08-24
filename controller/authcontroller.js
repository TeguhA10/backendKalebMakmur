const { Users } = require('../models');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        const userExists = await Users.findOne({ where: { email} });
        if (userExists) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }
        const usernameExists = await Users.findOne({ where: { username } });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username sudah terdaftar' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await Users.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: newUser.id, name: newUser.name, username: newUser.username, email: newUser.email }, process.env.FRONTEND_URL, {
            expiresIn: '1d',
        });

        res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 // 15 menit
        });

        // res.json({
        //     message: 'Login successful',
        //     token: token,
        //     users: {
        //         idusers: newUser.idusers,
        //         username: newUser.username,
        //         email: newUser.email
        //     }
        // });

        res.json({ message: 'Register successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan dalam registrasi' });
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Username atau password salah' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Username atau password salah' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, username: user.username, email: user.email }, process.env.FRONTEND_URL, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000 // 15 menit
        });

        // res.json({
        //     message: 'Login successful',
        //     token: token,
        //     users: {
        //         idusers: user.idusers,
        //         username: user.username,
        //         email: user.email,
        //         foto: user.foto
        //     }
        // });

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan dalam otentikasi' });
    }
}

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.FRONTEND_URL);
        req.user = verified;
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

const logout = (req, res, next) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};

module.exports = { register, login, logout, authenticateToken }