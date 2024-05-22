const cookieParser = require('cookie-parser');
const User = require('../model/userModel');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv').config();
const jwt = require("jsonwebtoken")

//get all the user list
const { hashPassword, comparePassword } = require("../helper/auth")
const getAllUser = async(req, res) => {
    //try catch method for fetch data and errors
    try {
        //db operation
        const users = await User.find({}).sort({ createdAt: -1 });
        //send user data using json
        res.status(200).json(users);
    } catch (error) {
        //display errors
        res.status(500).json({ message: "There is error following " + error.message })
    }
}

//helper function to genarate token
const generateToken = (user, secret, expiresIn) => {
        return jwt.sign({ id: user._id, username: user.username, email: user.email, role: user.role },
            secret, { expiresIn }
        );
    }
    //user login
const loginUser = async(req, res) => {
    try {
        //get user input via body
        const { username, password } = req.body;

        //db operation
        const user = await User.findOne({ username: username });

        //if user exists
        if (user) {
            //match his db password and user password
            const match = await comparePassword(password, user.password);

            //when it not match
            if (!match) {
                //access forbitten msg
                return res.status(403).json({ message: "Access Denied" })
            }

            //accee granted message
            /* return res.status(200).json({ message: "Access Granted" }) */

            /*  jwt.sign({ username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    throw err;
                } else {
                    res.cookie('token', token).json({ user, token });
                }
            })
 */


            //acssess token
            const accessToken = generateToken(user, process.env.JWT_SECRET, '1h');
            //refreash token
            const refreshToken = generateToken(user, process.env.JWT_RE_SECRET, '7d');

            res.cookie('accessToken', accessToken, { httpOnly: true, secure: true })
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })

            return res.status(200).json({ user, accessToken, refreshToken }); // Ensure a single response


        } else {
            return res.status(404).json({ message: "User not found" }); // Ensure a single response
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

const profileToken = async(req, res) => {
    const { accessToken, refreshToken } = req.cookies;

    if (accessToken) {
        try {
            const user = jwt.verify(accessToken, process.env.JWT_TOKEN);
            return res.json(user);
        } catch (err) {
            console.error("Error verifying access token:", err);
            return res.status(401).json({ error: "Access token verification failed" });
        }
    } else if (refreshToken) {
        try {
            const user = jwt.verify(refreshToken, process.env.JWT_RE_TOKEN);
            return res.json(user);
        } catch (err) {
            console.error("Error verifying refresh token:", err);
            return res.status(401).json({ error: "Refresh token verification failed" });
        }
    } else {
        return res.status(401).json({ error: "No token provided" });
    }
}


module.exports = { getAllUser, loginUser, registerUser, profileToken }