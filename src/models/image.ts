import mongoose, { Schema, Document } from "mongoose";

interface MyImage extends Document {
  filename?: string; 
  filePath: string;  
  album: mongoose.Types.ObjectId;
  _id:string;
}

const imageSchema = new Schema<MyImage>(
  {
    filename: { type: String, required: false }, 
    filePath: { type: String, required: true },  
    album: { type: Schema.Types.ObjectId, ref: "MyAlbum", required: true },
  },
  { timestamps: true }
);

const MyImage = mongoose.model<MyImage>("MyImage", imageSchema);
export default MyImage;
