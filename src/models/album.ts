import mongoose, { Schema, Document } from 'mongoose';
interface Album extends Document {
    title: string;
    description?: string;
    user: mongoose.Types.ObjectId; 
    images?: String[]; 
    
}

const albumSchema = new Schema<Album>({
    title: { type: String, required: true },
    description: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    images: [{ type: Schema.Types.ObjectId, ref: 'MyImage' }]
}, { timestamps: true });

const MyAlbum = mongoose.model<Album>('MyAlbum', albumSchema);
export default MyAlbum;
