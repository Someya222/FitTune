import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// SIGNUP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  profileCompleted: user.profileCompleted,
  token,
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { weight, height, gender } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (weight) user.weight = weight;
    if (height) user.height = height;
    if (gender) user.gender = gender;

    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};