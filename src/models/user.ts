import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    email: string;
    name?: string;
    userName?: string;
    addressLine1?: string;
    city?: string;
    country?: string;
    albums: mongoose.Types.ObjectId[]; 
}

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    userName: { type: String, unique: true },
    addressLine1: String,
    city: String,
    country: String,
    albums: [{ type: Schema.Types.ObjectId, ref: 'MyAlbum' }]
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
