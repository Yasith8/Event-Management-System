const User = require('../model/userModel');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
const { hashPassword, comparePassword } = require("../helper/auth")

const getAllUser = async(req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "There is error following " + error.message })
    }
}


const loginUser = async(req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username });

        if (user) {
            const match = await comparePassword(password, user.password);

            if (!match) {
                res.status(403).json({ message: "Access Denied" })
            }
            res.status(200).json({ message: "Access Granted" })
        }

    } catch (error) {
        res.status(500).json({ message: "There is error following " + error.message })
    }
}

const registerUser = async(req, res) => {
    try {
        const { username, email, password, role } = req.body;

        //password length need to more than 6 characters
        if (password.length < 6) {
            res.status(400).json({ message: "The length of the password should be at least 6 characters." });
        }

        //check email exist
        const existEmail = await User.findOne({ email: email });
        if (existEmail) {
            return res.status(409).json({ message: "Email is Already Exist" })
        }

        //check username exist
        const existUsername = await User.findOne({ username: username });
        if (existUsername) {
            return res.status(409).json({ message: "Username is Already Exist" })
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role

        })

        return res.status(200).json(user)


    } catch (error) {
        res.status(500).json({ message: "There is error following " + error.message })
    }
}

module.exports = { getAllUser, loginUser, registerUser }