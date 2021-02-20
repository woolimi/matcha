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
import UserLanguage from '../models/UserLanguage';
import UserReport from '../models/UserReport';

class Database {
	static async init() {
		console.log('⚡️[server]: Connected to MYSQL Server');
		await Tag.init();
		await User.init();
		await UserTag.init();
		await UserPicture.init();
		await UserVisit.init();
		await UserLike.init();
		await UserBlock.init();
		await UserNotification.init();
		await Chat.init();
		await ChatMessage.init();
		await UserLanguage.init();
		await UserReport.init();
	}
}

export default Database;
