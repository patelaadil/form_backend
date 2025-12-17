const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Create express object 

const app = express();

app.use(cors({
    origin:"https://frontend-xi-two-87.vercel.app"
}));
app.use(express.json());

// Mongoose connection

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongodb Atlas Connected !"))
.catch((err) => console.log(err));

// Mongoose user model ( create user collection schema )

const Schema = new mongoose.Schema({
    name:String,
    email:{type:String, unique:true},
    password:String
})

const Emp = mongoose.model("Employee",Schema);

// Register API

app.post("/register", async (req,res) => {
    const { name , email, password } = req.body;

    // check user exist or not
    const existUser = await Emp.findOne({ email });

    if(existUser){
        return res.json({ message: "!!! User already exists !!!" });
    }

    const hashPassword = await bcrypt.hash(password, 8);

    const emp = new Emp({
        name,
        email,
        password: hashPassword
    })

    await emp.save();

    res.json({ message: "Registered Successfully !"});
})

// Login API

app.post("/login", async (req,res) => {
    const { email, password } = req.body;

    // check user exist or not
    const existUser = await Emp.findOne({ email });

    if(!existUser){
        return res.json({ message : "!!! User not exist !!!"});
    }

    const Match = await bcrypt.compare(password, existUser.password);
    
    if(!Match){
        return res.json({ message : "!!! Password not matched !!!" });
    }

    res.json({ message : "Successfully Login " });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});