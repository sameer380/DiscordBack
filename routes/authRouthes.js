const express = require("express");
const router = express.Router();
require("dotenv").config();


const {
	login,
	registerUser,
} = require("../controller/authController");

router.post("/login", login);
router.post("/register", registerUser);

module.exports = router;
