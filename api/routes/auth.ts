import express from "express";
import jwt from "jsonwebtoken";
import authToken from "../middleware/authToken";

const authRouter = express.Router();

// access_token -> client session cookie
// refresh_token -> Secure/HttpOnly/SameSite cookie

authRouter.post("/login", (req, res) => {
	// Authenticate User
	const user = { id: 1234 };
	// const username = req.body.username;
	const refresh_token = setRefreshToken(res, user);
	res.json({
		access_token: generateToken(user, "access"),
		refresh_token,
	});
});

authRouter.post("/refresh", (req, res) => {
	// check refresh token
	const refresh_token = req.cookies["auth._refresh_token.local"];
	if (!refresh_token) return res.sendStatus(401);
	jwt.verify(
		refresh_token,
		process.env.REFRESH_TOKEN_SECRET,
		(err: any, user: any) => {
			if (err) {
				console.log("REFRESH TOKEN ERROR: ", err);
				return res.sendStatus(403);
			}
			delete user.exp;
			delete user.iat;
			// set new refresh_token in safe cookie
			const refresh_token = setRefreshToken(res, user);
			// return access token through json
			return res.json({
				access_token: generateToken(user, "access"),
				refresh_token,
			});
		},
	);
});

authRouter.delete("/logout", (req, res) => {
	// delete cookies
	const refresh_token = req.cookies["auth._refresh_token.local"];
	if (!refresh_token) return res.sendStatus(200);
	deleteRefreshToken(res);
	return res.sendStatus(200);
});

authRouter.post("/register", (req, res) => {
	// validate email and password
});

authRouter.get("/me", authToken, (req, res) => {
	res.send({
		user: {
			username: "wpark",
			age: 30,
		},
	});
});

function setRefreshToken(res: any, user: any) {
	const rtoken = generateToken(user, "refresh");
	res.cookie("auth._refresh_token.local", rtoken, {
		expires: new Date(Date.now() + 3600 * 24 * 7),
		secure: false,
		httpOnly: true,
		sameSite: true,
	});
	return rtoken;
}

function deleteRefreshToken(res: any) {
	return res.cookie("auth._refresh_token.local", "false", {
		expires: new Date(Date.now()),
		secure: false,
		httpOnly: false,
		sameSite: false,
	});
}

function generateToken(obj: object, option: string = "access") {
	// expires after half and hour (1800 seconds = 30 minutes)
	if (option == "access") {
		const access = jwt.sign(obj, process.env.ACESS_TOKEN_SECRET, {
			expiresIn: `${60 * 15}s`, // 15 mins
		});
		console.log("access token generated");
		return access;
	}
	if (option == "refresh") {
		const refresh = jwt.sign(obj, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: `${3600 * 24 * 7}s`, // 1 week
		});
		console.log("refresh token generated");
		return refresh;
	}
}

export default authRouter;
