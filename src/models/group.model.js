import mongoose from "mongoose";
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);
