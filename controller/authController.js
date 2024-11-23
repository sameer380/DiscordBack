const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const USER = require("../models/user"); // Import your User model

const jwtSecret = process.env.JWT_SECRET || "defaultSecret"; // Replace with environment variable in production

// User Registration
const registerUser = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!(username && email && password)) {
			return res.status(400).json({ error: "All fields are compulsory" });
		}

		// Check if user already exists
		const existingUser = await USER.findOne({ $or: [{ email }] });
		if (existingUser) {
			return res
				.status(422)
				.json({ error: "User already exists with this email." });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create and save the user
		const user = new USER({ username, email, password: hashedPassword });
		await user.save();

		res.status(201).json({ message: "User registered successfully." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred during registration." });
	}
};

// User Login
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Please provide email and password." });
		}

		// Check if user exists
		const savedUser = await USER.findOne({ email });
		if (!savedUser) {
			return res
				.status(404)
				.json({ error: "User not found. Please sign up first." });
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, savedUser.password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid password." });
		}

		// Generate JWT token
		const token = jwt.sign({ _id: savedUser._id }, jwtSecret, {
			expiresIn: "1h",
		});
		const { username, email: userEmail } = savedUser;

		res.json({
			token,
			user: { username, email: userEmail },
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "An error occurred during login." });
	}
};

module.exports = {
	login,
	registerUser,
};
