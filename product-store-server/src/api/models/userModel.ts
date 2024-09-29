import mongoose, { Document, Schema, Model, ObjectId } from 'mongoose';

// Define the IUser interface that extends Document (Mongoose Document)
export interface IUser extends Document {
    _id: ObjectId | string;  // MongoDB ObjectId can also be treated as a string
    name: string;
    email: string;
    password: string;
    profilePicture?: string;
    isAdmin: boolean;
    googleId?: string;
}

// Mongoose schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String },
});

// Create the user model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
