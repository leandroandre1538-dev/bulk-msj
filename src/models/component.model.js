import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['header', 'body', 'footer', 'button'], // Define los tipos posibles
        required: true
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: true
    },
    properties: {
        contenido: { type: String, required: true },
        ejemplos: { type: String },
        valoresEstablecer: { type: String }
    }
}, {
    timestamps: true
});

export default mongoose.model('Component', componentSchema);