const UserModel = require("../models/user.models");

const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await UserModel.create({
      username,
      email,
      password,
    });

    const token = user.generateAccessToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("error in register controller:", error);
    return res.status(500).json({
      message: "internal server eRror",
    });
  }
};

const loginController = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // const user = await UserModel.findOne({ email });

    // if (!user) {
    //   return res.status(404).json({
    //     message: "User does not exist",
    //   });
    // }

    // const isPasswordCorrect = await user.isPasswordCorrect(password);

    // if (!isPasswordCorrect) {
    //   return res.status(401).json({
    //     message: "Invalid credentials",
    //   });
    // }

    // const token = user.generateAccessToken();

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    // });

    // const loggedInUser = await UserModel.findById(user._id).select("-password");
console.log("yanha tak pocha")
    return res.status(200).json({
      message: "Login successful",
      user: req.body,
    });
  } catch (error) {
    console.log("Error in login controller:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("token");

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in logout controller:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { registerController, loginController, logoutController };
