import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js"
export const signup = async (request, response) => {
    try {
        const { fullname, username, email, password} = request.body;
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!emailRegex.test(email)) {
            return response.status(400).json({
                error: "Invalid email format"
            })
        }

        const existingUser = await User.findOne({ username })

        if (existingUser) {
            return response.status(400).json({ error: "Username is already taken" })
        }
        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            return response.status(400).json({ error: "Email is already taken" })
        }

        if (password.length < 6) {
            return response.status(400).json({ error: "Invalid password" })
        }
        // Hash password

        const salt = await bcrypt.genSalt(10);
        const hashedPW = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPW
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, response);
            await newUser.save();

            response.status(201).json({
                _id: newUser.id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                following: newUser.following,
                followers: newUser.followers,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg
            })
        } else {
            response.status(400).json({
                error: "Invalid user data"
            })
        }

    } catch (error) {
        console.log("Error is signup controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const login = async (request, response) => {
    try {
        const { username, password } = request.body;
        const user = await User.findOne({
            username,
        })

        const isCorrect = await bcrypt.compare(password, user?.password || "")
        if (!user || !isCorrect) {
            return response.status(400).json({
                error: "登陆失败"
            })
        } else {
            
            generateTokenAndSetCookie(user._id, response);
            return response.status(200).json({
                _id: user.id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                following: user.following,
                followers: user.followers,
                profileImg: user.profileImg,
                coverImg: user.coverImg
            })
        }

    } catch (error) {
        console.log("Error is login controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}

export const logout = async (request, response) => {
    try {
        response.cookie("jwt", "", {maxAge: 0})            
        response.status(200).json({
            message: "Logged out successfully"
        })
    } catch (error) {
        console.log("Error is logout controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }
}


export const getMe = async (request, response) => {
    try {
        const user = await User.findById(request.user._id).select('-password')
        response.status(200).json({
            user
        })
    } catch (error) {
        console.log("Error is getMe controller", error.message);
        response.status(500).json({
            error: "Internal Server Error"
        })
    }


}