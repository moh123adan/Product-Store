import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import asyncHandler from 'express-async-handler';
import User, { IUser } from '../models/userModel'; // Importing the IUser interface
import { sendPasswordResetEmail } from '../utils/sendEmail';
import mongoose from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { Request, Response } from 'express';

// Create token
const createToken = (id: string, isAdmin: boolean): string => {
  return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};

// Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Register user
const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, password_confirm, isAdmin } = req.body;
    const profilePicture = req.file ? req.file.path : null;
  
    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
  
    // Validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Please enter a strong password' });
    }
  
    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    const newUser = new User({
      name,
      email,
      profilePicture,
      password: hashedPassword,
      isAdmin,
    });
    const user = await newUser.save();
  
    // Convert user._id to a string
    const token = createToken(user._id.toString(), user.isAdmin);
  
    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
      },
      token,
    });
  });
  

// Login user
const loginUser = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ success: false, message: 'User does not exist' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }

  const token = createToken(user._id, user.isAdmin);
  return res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    token,
  });
});

// Google login user
const googleLogin = asyncHandler(async (req: Request, res: Response): Promise<Response> => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { sub, email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ googleId: sub, email, name });
      await user.save();
    }

    const token = createToken(user._id, user.isAdmin);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Other controller functions remain the same, using the `isAdmin` field where necessary

export {
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  forgotPassword,
  getResetPasswordToken,
  resetPassword,
  createUser,
  googleLogin,
  updateUser,
  deleteUser,
};
