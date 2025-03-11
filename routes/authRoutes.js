const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/userSchema");

const router = express.Router();

router.post("/register", async (req, res) => {
  const today = new Date();
  const userData = {
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    created: today,
  };
  console.log(userData)
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { userName: req.body.userName }],
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      userData.password = hashedPassword;
      const newUser = await User.create(userData);
      if (newUser) {
        const token = await jwt.sign(
          { email: newUser._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        res.cookie("expenseAuth", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // CORRECTED (was !==)
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.json({
          status: newUser.userName + " Registered Successfully!",
          
        });
      }
    } else {
      console.error('Email or Username already exists, Please use another one')
      resstatus(400).json({
        error: "Email or Username already exists, Please use another one !",
      });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error, please try again later." });
  }
});

router.post("/login", async (req, res) => {
  console.log(req.host)
  const userName = req.body.userName;
  const password = req.body.password;
  const user = await User.findOne({ userName });
  if (!user) {
    res.status(400).json({ error: "User not found" });
    return;
  } else {
    try {
      const hashedPassword = user.password;
      const isValidPass = await bcrypt.compare(password, hashedPassword);
      if (!isValidPass) {
        res.status(400).json({ error: "Invalid Credentials" });
        return;
      } else {
        const token = await jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        res.cookie("expenseAuth", token, {
          httpOnly: true,
          secure: true, // CORRECTED (was !==)
          sameSite: "None",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
          status: "Welcome " + user.userName,
          ...(process.env.NODE_ENV !== "production" && { token }),
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

router.post('/logout',(req,res)=>{
  const token = req.cookies.expenseAuth
  if(!token){
    return res.status(401).json({authenticated:false})
  }
  res.cookie("expenseAuth", token, {
    httpOnly: true,
    secure: true,  // Always use secure in production
    sameSite: "None",  // Important for cross-domain requests
    maxAge: 7 * 24 * 60 * 60 * 1000,
    // Add domain if your frontend and backend share a parent domain
    // domain: ".yourdomain.com"  // Note the leading dot
  });
  res.json({ message: 'Logged out successfully' });
})

router.get('/verify',async(req,res)=>{
  const token = req.cookies.expenseAuth
  console.log("All cookies:", req.cookies);
  console.log("Auth cookie:", req.cookies.expenseAuth);
  console.log("Headers:", req.headers);
  
  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ authenticated: false });
  }
  try {
console.log("VERIFY ROUTE BHAIYAAAA",token)
    const user = await jwt.verify(token,process.env.JWT_SECRET)
console.log("VERIFY ROUTE BHAIYAAAAuser",user)
    console.log(user)
    if(!user){
      return res.status(401).json({authenticated:false})
    }
    return res.status(200).json({authenticated:true,userId:user})
  } catch (error) {
    console.error(error)
  }
})

router.post("/logout", (req, res) => {
  res.clearCookie("expenseAuth", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    path: "/"
  });

  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
