const express = require('express');
const router = express.Router();

const multer = require('multer');
const { login, register, logout, authenticateToken } = require('../controller/authcontroller');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'files/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    },
});

const upload = multer({ storage });

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateToken,  logout);

module.exports = router;
