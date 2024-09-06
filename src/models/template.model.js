import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    templateName: {
        type: String,
        required: true
    },
    frequency: {
        type: Number,
        required: true
    },
    frequencyType: {
        type: String,
        enum: ['seconds', 'minutes', 'hours', 'days'],
        required: true
    },
    contactGroup: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Template', templateSchema);