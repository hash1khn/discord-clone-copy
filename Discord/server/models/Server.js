import mongoose from 'mongoose';

const serverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Server name is required'],
        trim: true,
        minLength: [3, 'Server name must be at least 3 characters']
    },
    description: {
        type: String,
        required: [true, 'Server description is required'],
        maxLength: [500, 'Description cannot exceed 500 characters']
    },
    handle: {
        type: String,
        required: [true, 'Server handle is required'],
        unique: true,
        match: [/^@\w+$/, 'Handle must start with @ and contain only letters, numbers, and underscores']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'moderator'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    avatar: {
        type: String,
        default: ''
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for searching servers
serverSchema.index({ name: 'text', description: 'text' });

const Server = mongoose.model('Server', serverSchema);
export default Server;