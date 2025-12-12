import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        profileImageUrl: {
            type: String,
            default: '',
        },
            studyStreak: {
                type: Number,
                default: 0,
            },
            lastStudyDate: {
                type: Date,
            },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
