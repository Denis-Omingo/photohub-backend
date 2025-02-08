import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

const SECRET_KEY = process.env.JWT_SECRET || "secret=hhgcfddf-key";

const createCurrentUser = async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("request body", req.body);
    const { userId, email } = req.body;

    let user = await User.findOne({ email});

    if (!user) {
      user = new User(req.body);
      await user.save();
    }

    //  Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    // Set HTTP-Only Secure Cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",     // For cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    

    return res.status(200).json({
      token,
      userId: user.userId,
      email: user.email,
      name: user.name || null,
      addressLine1: user.addressLine1 || null,
      username: user.userName || null,
      country: user.country || null,
    });
  } catch (error) {
    console.error(error, "auto error");
    return res.status(500).json({ message: "Error creating user" });
  }
};

const updateCurrentUser=async (req:Request, res:Response):Promise<any>=>{
  try{
    const{email,name, addressLine1, country,city,userName}=req.body;
    const user=await User.findOne({email});

    if(!user){
      return res.status(404).json({message:"User not found"})
    }

    user.name=name;
    user.addressLine1=addressLine1;
    user.city=city;
    user.country=country;
    user.userName=userName;

    await user.save();
  }catch(error){
    console.log(error)
    res.status(500).json({message: "Error in updating user!"})
  }
}

//logout

const logoutUser = async (req: Request, res: Response): Promise<any> => {
  try {
      res.clearCookie("auth_token", {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
      });
      return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Logout failed" });
  }
};

export default { createCurrentUser, logoutUser,updateCurrentUser };

