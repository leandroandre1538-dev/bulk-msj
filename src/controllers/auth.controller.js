import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from "../config.js";

export const register = async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    try {
        const userFound = await User.findOne({ email });
        if (userFound) {
            return res.status(400).json(["Correo ya usado"]);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: passwordHash,
            firstName,
            lastName
        });

        const userSaved = await newUser.save();

        const token = await createAccessToken({ id: userSaved._id });

        res.cookie('token', token);
        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            firstName: userSaved.firstName,
            lastName: userSaved.lastName,
            createdAt: userSaved.createdAt,
            updateAt: userSaved.updatedAt
        });
    } catch (error) {
        console.log(error);
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await User.findOne({ email });
        if (!userFound) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = await createAccessToken({ id: userFound._id });

        res.cookie('token', token);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            firstName: userFound.firstName,
            lastName: userFound.lastName,
            createdAt: userFound.createdAt,
            updateAt: userFound.updatedAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0)
    })
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    const userFound = await User.findById(req.user.id);

    if (!userFound) {
        return res.status(400).json({ message: "Usuario no encontrado" });
    }

    return res.json({
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        createdAt: userFound.createdAt,
        updateAt: userFound.updatedAt
    })
}

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userFound = await User.findById(user.id);
        if (!userFound) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        return res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            firstName: userFound.firstName,
            lastName: userFound.lastName
        });
    })
}