import mysql from 'mysql2';
import database from '../config/database.json';
import Chat from '../models/Chat';
import ChatMessage from '../models/ChatMessage';
import Tag from '../models/Tag';
import User from '../models/User';
import UserBlock from '../models/UserBlock';
import UserLike from '../models/UserLike';
import UserNotification from '../models/UserNotification';
import UserPicture from '../models/UserPicture';
import UserTag from '../models/UserTag';
import UserVisit from '../models/UserVisit';

class MySQL {
	static con = mysql.createConnection(database.MYSQL_CONFIG);

	static CHARSET = 'utf8mb4';
	static COLLATION = 'utf8mb4_unicode_ci';

	static init() {
		const con = MySQL.con;
		con.connect((err) => {
			if (err) throw err;
			console.log('⚡️[server]: Connected to MYSQL Server');
			Tag.init();
			User.init();
			UserTag.init();
			UserPicture.init();
			UserVisit.init();
			UserLike.init();
			UserBlock.init();
			UserNotification.init();
			Chat.init();
			ChatMessage.init();
		});
	}
}

export default MySQL;
