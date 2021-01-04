import mailgun from "mailgun-js";
import dotenv from "dotenv";
dotenv.config();

const DOMAIN = "sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org";
const API_KEY = process.env.MAILGUN_API;
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

export default {
	async send_email_to_verify(to: string, email_verification_url: string) {
		console.log("URL", email_verification_url);
		const data = {
			from:
				"no-reply <postmaster@sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org>",
			to,
			subject: "Email verification",
			template: "verification",
			"h:X-Mailgun-Variables": JSON.stringify({ email_verification_url }),
		};
		try {
			return await mg.messages().send(data);
		} catch (error) {
			throw error;
		}
	},
};
