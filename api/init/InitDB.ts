import Database from './Database';
import MySQL from './MySQL';

async function init_db() {
	try {
		await MySQL.pool.query('DROP DATABASE `matcha`');
		await MySQL.pool.query('CREATE DATABASE `matcha`');
		await MySQL.pool.query('USE `matcha`');
		await Database.init();
		process.exit();
	} catch (error) {
		console.error(error);
		process.exit();
	}
}

init_db();
