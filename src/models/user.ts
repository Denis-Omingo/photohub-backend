import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    userId:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
    },
    userName:{
        type: String,
        unique: true
    },
    addressLine1:{
        type: String,
    },
    city:{
        type: String,
    },
    country:{
        type: String,
    },
},

);

const User=mongoose.model("User", userSchema);
export default User;