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
		subject: content.subject,
		template,
		'h:X-Mailgun-Variables': JSON.stringify(content),
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
		content.subject = 'Email verification';
		content.email_verification_url = `${process.env.API}/auth/email-verification/${token}`;
		const mail = await send_email(to, 'verification', content);
		console.log('Email : ', mail);
		console.log('Email verification token : ', token);
	} catch (error) {
		throw error;
	}
}

export async function send_reset_password_email(to: string, new_password: string) {
	try {
		const content: any = {};
		content.new_password = new_password;
		content.subject = 'Reset Password';

		const mail = await send_email(to, 'reset_password', content);
		console.log('Email : ', mail);
	} catch (error) {
		throw error;
	}
}
