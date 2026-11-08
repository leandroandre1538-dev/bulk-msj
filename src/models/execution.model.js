import mongoose from "mongoose";

// Registro de cada envío masivo (una "ejecución") y el resultado por número.
const resultSchema = new mongoose.Schema({
    phone: String,
    state: { type: String, enum: ['success', 'warning'] },
    description: String
}, { _id: false });

const executionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    templateName: { type: String, required: true },
    templateLanguage: String,
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    groupName: String,
    total: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    finishedAt: Date,
    results: { type: [resultSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Execution', executionSchema);
