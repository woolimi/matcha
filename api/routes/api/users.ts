import express from "express";
import authToken from "../../middleware/authToken";

const usersRouter = express.Router();

// get user
usersRouter.get("/", authToken, (req, res) => {});

export default usersRouter;
