import express,{Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import MyUserRoute from "./routes/MyUserRoute"
import LogOutRoute from "./routes/LogOutRoute"
import MyAlbumRoute from "./routes/MyAlbumRoute"
import MyImageRoute from "./routes/MyImageRoute"

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)

.then(()=>{
  console.log("Connected to database!")
});

const app=express();
app.use(express.json()); 
app.use(cors({
  origin: "https://myalbums.onrender.com", 
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,  
}));

app.use("/api/user", MyUserRoute)
app.use("/api/logout", LogOutRoute)

app.use("/api/albums", MyAlbumRoute)
app.use("/api/images", MyImageRoute);
app.use("/uploads", express.static("uploads"));

app.listen(7000, ()=>{
    console.log("Server started on localhost: 7000");
})
