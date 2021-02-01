import mailgun from 'mailgun-js';
import dotenv from 'dotenv';
import { generateToken } from './Token';

dotenv.config();

const DOMAIN = 'sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org';
const API_KEY = process.env.MAILGUN_API;
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

async function send_email(to: string, template: string, content: any) {
	console.log('URL', content.email_verification_url);
	const data = {
		from: 'no-reply <postmaster@sandboxd05e92bd5d9e40f99e93d11755f649a2.mailgun.org>',
		to,
		subject: 'Email verification',
		template,
		'h:X-Mailgun-Variables': JSON.stringify({ email_verification_url: content.email_verification_url }),
	};
	try {
		return await mg.messages().send(data);
	} catch (error) {
		throw error;
	}
}

export async function send_verification_email(to: string, userId: number) {
	// send email with jwt (15 mins limit)
	try {
		const token = generateToken({ id: userId }, 'access');
		const content: any = {};
		content.email_verification_url = `http://localhost:5000/auth/email-verification/${token}`;
		const mail = await send_email(to, 'verification', content);
		console.log('Email : ', mail);
		console.log('Email verification token : ', token);
	} catch (error) {
		throw error;
	}
}
