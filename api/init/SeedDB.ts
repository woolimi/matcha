import User from '../models/User';
import UserPicture from '../models/UserPicture';
import Tag from '../models/Tag';
import genders from './Genders.json';
import bcrypt from 'bcrypt';
import Model from '../models/Model';
import faker from 'faker';
import UserTag from '../models/UserTag';
import UserLanguage from '../models/UserLanguage';

faker.locale = 'fr';

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

async function create_seed_users() {
	try {
		const password = await bcrypt.hash('asdfasdf', 10);
		const current_year = new Date().getFullYear();
		const tags = await Tag.get_tag_ids();
		const langs = ['English', 'English', 'English', 'English', 'French', 'French', 'French', 'Korean'];
		const unique_pairs: string[] = [];
		for (let i = 0; i < genders.length; i++) {
			let lastName, firstName, username;
			const lng = faker.random.number({ min: 2.107361, max: 2.489544, precision: 0.0001 });
			const lat = faker.random.number({ min: 48.785862, max: 48.947325, precision: 0.0001 });
			do {
				lastName = faker.name.lastName(genders[i]);
				firstName = faker.name.firstName(genders[i]);
				username = `${lastName}.${firstName}`;
			} while (unique_pairs.indexOf(username) >= 0);
			unique_pairs.push(username);
			const user = {
				email: faker.internet.email(),
				username,
				password,
				lastName,
				firstName,
				gender: genders[i] === 0 ? 'female' : 'male',
				preferences: Math.floor(Math.random() * 6) === 1 ? 'bisexual' : 'heterosexual',
				biography: faker.hacker.phrase(),
				birthdate: faker.date.between(new Date(String(current_year - 50)), new Date(String(current_year - 18))),
				lng,
				lat,
			};
			const { insertId } = await User.create_fake_user(user);
			const randomTagId = Math.floor(Math.random() * tags.length);
			// add profile picture
			await UserPicture.create_or_update(insertId, 0, `https://i.pravatar.cc/300?img=${i + 1}`);
			// add tags
			await UserTag.add_tag(insertId, tags[randomTagId]);
			await UserTag.add_tag(insertId, tags[(randomTagId + 1) % tags.length]);
			// add languages
			await UserLanguage.add(insertId, langs[Math.floor(Math.random() * langs.length)]);
			console.log('Fake user craeted', user, insertId);
		}
	} catch (error) {
		throw error;
	}
}

async function create_seed() {
	try {
		await Model.query('START TRANSACTION');
		await create_seed_tags();
		await create_seed_users();
		await Model.query('COMMIT');
		process.exit();
	} catch (error) {
		console.error(error);
		await Model.query('ROLLBACK');
		process.exit();
	}
}

create_seed();
