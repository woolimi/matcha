import User from '../models/User';
import UserPicture from '../models/UserPicture';
import Tag from '../models/Tag';
import genders from './Genders.json';
import bcrypt from 'bcrypt';
import Model from '../models/Model';
import faker from 'faker';
import UserTag from '../models/UserTag';
import UserLanguage from '../models/UserLanguage';
import UserLike from '../models/UserLike';
import UserReport from '../models/UserReport';

faker.locale = 'en';

async function create_seed_tags() {
	try {
		// INSERT IGNORE INTO
		await Tag.add('vegan');
		await Tag.add('geek');
		await Tag.add('piercing');
		await Tag.add('sports');
		await Tag.add('climbing');
		await Tag.add('ecole42');
		await Tag.add('photography');
		await Tag.add('dog');
		await Tag.add('cat');
		await Tag.add('sns');
		console.log('Tag created');
	} catch (error) {
		throw error;
	}
}

const genderArr = ['female', 'male'];

// get random number min <= x <= max
function get_random(min: number, max: number, not: number | null = null) {
	if (not) {
		let selected;
		do {
			selected = Math.floor(Math.random() * (max + 1) + min);
		} while (not === selected);
		return selected;
	} else return Math.floor(Math.random() * (max + 1) + min);
}

async function create_seed_users() {
	try {
		const users = await User.query('SELECT * FROM users COUNT');
		if (users.length >= 500) {
			console.log('Seed user already created');
			return;
		}
		const password = await bcrypt.hash('asdfasdf', 10);
		const current_year = new Date().getFullYear();
		const tags = await Tag.get_tag_ids();
		const langs = [
			'English',
			'English',
			'English',
			'French',
			'French',
			'French',
			'Italian',
			'Italian',
			'Italian',
			'Spanish',
			'Spanish',
			'Spanish',
			'Korean',
			'Chinese',
		];
		const unique_pairs: string[] = [];
		const unique_emails: string[] = [];
		for (let i = 0; i < 500; i++) {
			let lastName, firstName, username, email;
			const lng = faker.random.number({ min: 2.107361, max: 2.489544, precision: 0.0001 });
			const lat = faker.random.number({ min: 48.775862, max: 48.957325, precision: 0.0001 });
			do {
				lastName = faker.name.lastName(genders[i]);
				firstName = faker.name.firstName(genders[i]);
				username = `${lastName}.${firstName}`;
				email = faker.internet.email();
			} while (unique_pairs.indexOf(username) >= 0 || unique_emails.indexOf(email) >= 0);
			unique_pairs.push(username);
			unique_emails.push(email);
			const gender = i < 70 ? genderArr[genders[i]] : genderArr[get_random(0, 1)];
			const user = {
				email: faker.internet.email(),
				username,
				password,
				lastName,
				firstName,
				gender,
				preferences: Math.floor(Math.random() * 6) === 1 ? 'bisexual' : 'heterosexual',
				biography: faker.hacker.phrase(),
				birthdate: faker.date.between(new Date(String(current_year - 50)), new Date(String(current_year - 18))),
				lng,
				lat,
				fame: get_random(0, 100),
				login: new Date(Date.now() - 3600 * 24 * 1000 * Math.floor(Math.random() * 10)),
			};
			const { insertId } = await User.create_fake_user(user);
			const randomTagId = Math.floor(Math.random() * tags.length);
			// add profile picture
			if (i < 70) await UserPicture.create_or_update(insertId, 0, `https://i.pravatar.cc/300?img=${i + 1}`);
			else await UserPicture.create_or_update(insertId, 0, `https://picsum.photos/seed/${username}/300/300`);
			// add tags
			await UserTag.add_tag(insertId, tags[randomTagId]);
			await UserTag.add_tag(insertId, tags[(randomTagId + 1) % tags.length]);
			// add languages
			await UserLanguage.add(insertId, langs[Math.floor(Math.random() * langs.length)]);
		}
		console.log('Fake user seed created');
	} catch (error) {
		throw error;
	}
}

async function create_seed_user_likes() {
	try {
		const ulikes = await UserLike.query('SELECT * FROM user_likes COUNT');
		if (ulikes.length >= 300) return console.log('user_likes seed already created');
		let prv = 1;

		for (let i = 0; i < 500; i++) {
			let nxt = get_random(1, 500, prv);
			await UserLike.query('INSERT IGNORE INTO user_likes (user, liked) VALUES (?, ?)', [prv, nxt]);
			prv = nxt;
		}
		console.log('user_likes seed created');
	} catch (error) {
		throw error;
	}
}

async function create_seed_user_reports() {
	try {
		const ureports = await UserReport.query('SELECT * FROM user_reports COUNT');
		if (ureports.length >= 5) return console.log('user_reports seed already created');
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 50]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [2, 50]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [3, 50]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 49]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [2, 49]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [3, 48]);
		await UserReport.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 48]);
		console.log('user_reports seed created');
	} catch (error) {
		throw error;
	}
}

async function create_seed() {
	try {
		await Model.query('START TRANSACTION');
		await create_seed_tags();
		await create_seed_users();
		// await create_seed_user_likes();
		// await create_seed_user_reports();
		await Model.query('COMMIT');
		process.exit();
	} catch (error) {
		console.error(error);
		await Model.query('ROLLBACK');
		process.exit();
	}
}

create_seed();
