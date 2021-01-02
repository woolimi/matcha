import Model from "./Model";

class User extends Model {
	static table =
		"CREATE TABLE `users` ( \
			`id` int NOT NULL AUTO_INCREMENT, \
			`email` varchar(60) COLLATE utf8_bin NOT NULL, \
			`username` varchar(20) COLLATE utf8_bin NOT NULL, \
			`password` varchar(100) COLLATE utf8_bin NOT NULL, \
			`lastName` varchar(45) COLLATE utf8_bin NOT NULL, \
			`firstName` varchar(45) COLLATE utf8_bin NOT NULL, \
			`verified` tinyint NOT NULL DEFAULT '0', \
			PRIMARY KEY (`id`), \
			UNIQUE KEY `email_UNIQUE` (`email`), \
			UNIQUE KEY `username_UNIQUE` (`username`) \
		) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin";
	static init(): Promise<any> {
		return Model.init("users", User);
	}
}

export default User;
