import mongoose from "mongoose";
const Schema = mongoose.Schema;

const credentialSchema = new Schema({
    wabId: {
        type: String,
        required: true
    },
    phoneId: {
        type: String,
        required: true
    },
    tokenAccess: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Credential', credentialSchema);