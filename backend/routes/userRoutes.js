const express = require('express');
const router = express.Router();

const { getAllUser, loginUser, registerUser, profileToken } = require("../controller/userController")

router.get('/auth/alluser', getAllUser)

router.post('/auth/login', loginUser)

router.post('/auth/register', registerUser)


router.get('/auth/profile', profileToken)

module.exports = router;