import express,{Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import MyUserRoute from "./routes/MyUserRoute"
import LogOutRoute from "./routes/LogOutRoute"

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=>{
  console.log("Connected to database!")
});

const app=express();
app.use(express.json()); 
app.use(cors({
  origin: "http://localhost:5173", // Specify your frontend's URL
  credentials: true,       
}));

app.use("/api/user", MyUserRoute)
app.use("/api/logout", LogOutRoute)

app.listen(7000, ()=>{
    console.log("Server started on localhost: 7000");
})
