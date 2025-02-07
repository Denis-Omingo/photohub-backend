
import { Request, Response } from "express";
import User from '../models/user';

  const createCurrentUser = async (req: Request, res: Response):Promise<any> => {
    try {
      console.log("request body", req.body);
      const {userId} = req.body;
  
      const existingUser = await User.findOne({userId});
  
      if (existingUser) {
        return res.status(200).send();
      }
  
      const newUser = new User(req.body);
      await newUser.save();
  
      return res.status(201).json(newUser.toObject()); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating user" }); 
    }
  };
  

const MyUserController = {
    createCurrentUser
  };
  
  export default MyUserController;
  
