import express,{Request, Response} from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string)
.then(()=>{
  console.log("Connected to database!")
});

const app=express();
app.use(express.json()); //converts every request to JSON so that we don't have to do it ourselves.
app.use(cors());

app.get("/test", async(req: Request, res: Response)=>{
  res.json({message: "Hello Denis!"})
})

app.listen(7000, ()=>{
    console.log("Server started on localhost: 7000");
})
