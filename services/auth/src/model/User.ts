import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    role: string;
    password: string;
}

const schema: Schema<IUser> = new Schema({
    name: { type: String,
         required: true
         },
    email: { type: String,
         required: true,
         unique: true
            },
    image: { type: String
    },
    role: {
         type: String,
         default: null
        },
    password: {
        type: String,
    },
    },{
        timestamps: true
    });

    export const User = mongoose.model<IUser>('User', schema);
