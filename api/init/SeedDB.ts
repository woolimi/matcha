import User from '../models/User';
import UserPicture from '../models/UserPicture';
import Tag from '../models/Tag';
import genders from './Genders.json';
import bcrypt from 'bcrypt';
import Model from '../models/Model';
import faker from 'faker';
import UserTag from '../models/UserTag';
import UserLanguage from '../models/UserLanguage';
import languages from './languages';

faker.locale = 'fr';

async function create_seed_tags() {
	try {
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
		const password = await bcrypt.hash('asdf', 10);
		const current_year = new Date().getFullYear();
		const tags = await Tag.get_tag_ids();
		const langs = ['English', 'English', 'English', 'English', 'French', 'French', 'French', 'Korean'];
		// for (let i = 0; i < genders.length; i++) {
		for (let i = 0; i < 1; i++) {
			const lastName = faker.name.lastName(genders[i]);
			const firstName = faker.name.firstName(genders[i]);
			const user = {
				email: faker.internet.email(),
				username: `${lastName}.${firstName}`,
				password,
				lastName,
				firstName,
				gender: genders[i] === 0 ? 'female' : 'male',
				preferences: Math.floor(Math.random() * 6) === 1 ? 'bisexual' : 'heterosexual',
				biography: faker.hacker.phrase(),
				birthdate: faker.date.between(new Date(String(current_year - 50)), new Date(String(current_year - 18))),
				lng: faker.random.number({ min: -0.6, max: 4.3, precision: 0.001 }),
				lat: faker.random.number({ min: 45.0, max: 50.0, precision: 0.001 }),
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
