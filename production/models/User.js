"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MySQL_1 = __importDefault(require("../init/MySQL"));
const Model_1 = __importDefault(require("./Model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = __importDefault(require("lodash"));
const Location_1 = require("../services/Location");
const UserPicture_1 = __importDefault(require("./UserPicture"));
const UserTag_1 = __importDefault(require("./UserTag"));
const UserLanguage_1 = __importDefault(require("./UserLanguage"));
class User extends Model_1.default {
    static init() {
        return Model_1.default.init('users', User);
    }
    static me(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield User.find(id);
                user.location = Location_1.xy2ll(user.location);
                user.images = yield UserPicture_1.default.get_images(user.id);
                user.tags = yield UserTag_1.default.get_tags(user.id);
                user.languages = yield UserLanguage_1.default.get_languages(user.id);
                return lodash_1.default.pick(user, [
                    'id',
                    'email',
                    'username',
                    'lastName',
                    'firstName',
                    'verified',
                    'gender',
                    'preferences',
                    'location',
                    'images',
                    'tags',
                    'biography',
                    'languages',
                    'birthdate',
                    'fame',
                ]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static updatePublic(user_id, formData) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield MySQL_1.default.pool.getConnection();
            try {
                yield conn.query('START TRANSACTION');
                yield conn.query('UPDATE users SET username = ?, firstName = ?, lastName = ?, gender = ?, preferences = ?, biography = ?, birthdate = ? WHERE id = ?', [
                    formData.username,
                    formData.firstName,
                    formData.lastName,
                    formData.gender,
                    formData.preferences,
                    formData.biography,
                    formData.birthdate,
                    user_id,
                ]);
                for (const tag of formData.tags) {
                    yield conn.query('INSERT IGNORE INTO tags (`name`) VALUES (?)', [tag]);
                }
                yield conn.query('DELETE FROM user_tags WHERE user = ?', user_id);
                for (const tag of formData.tags) {
                    const [rows, fields] = yield conn.query('SELECT * FROM tags WHERE name = ? LIMIT 1', [tag]);
                    yield conn.query('INSERT INTO user_tags (`user`, `tag`) VALUES (?, ?)', [user_id, rows[0].id]);
                }
                yield conn.query('DELETE FROM user_languages WHERE user = ?', user_id);
                for (const lang of formData.languages) {
                    yield conn.query('INSERT INTO user_languages (`user`, `language`) VALUES (?, ?)', [user_id, lang]);
                }
                yield conn.query('COMMIT');
                yield conn.release();
            }
            catch (error) {
                yield conn.query('ROLLBACK');
                yield conn.release();
                throw error;
            }
        });
    }
    static register(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = Object.assign({}, formData);
                data.password = yield bcrypt_1.default.hash(formData.password, 10);
                const xy = Location_1.ll2xy(data.location);
                return yield User.query('INSERT INTO `users` (`email`, `username`, `password`, `firstName`, `lastName`, `verified`, `location`) \
				VALUES (?, ?, ?, ?, ?, false, ST_SRID(POINT(?, ?), 4326))', [data.email, data.username, data.password, data.firstName, data.lastName, xy.x, xy.y]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static register_google(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = Object.assign({}, formData);
                const user = yield User.query('SELECT * FROM users WHERE provider = ? AND provider_id = ? LIMIT 1', [
                    data.provider,
                    data.provider_id,
                ]);
                if (user.length === 1)
                    return user[0].id;
                data.password = yield bcrypt_1.default.hash(formData.password, 10);
                const xy = Location_1.ll2xy(data.location);
                yield Model_1.default.query(`START TRANSACTION`);
                const { insertId, } = yield User.query('INSERT INTO `users` (`email`, `username`, `password`,`firstName`, `lastName`,  `verified`, `location`, `provider`, `provider_id`) \
					VALUES (?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), ?, ?)', [
                    data.email,
                    data.username,
                    data.password,
                    data.firstName,
                    data.lastName,
                    data.verified,
                    xy.x,
                    xy.y,
                    data.provider,
                    data.provider_id,
                ]);
                yield UserPicture_1.default.query('INSERT INTO `user_pictures` (`user`, `picture`, `path`) VALUES (?, ?, ?)', [
                    insertId,
                    0,
                    data.picture,
                ]);
                yield Model_1.default.query('COMMIT');
                return insertId;
            }
            catch (error) {
                yield Model_1.default.query('ROLLBACK');
                throw error;
            }
        });
    }
    static mainPictureUrl(path) {
        if (path && path.match(/^https:\/\//))
            return path;
        return `${process.env.API}/${path}`;
    }
    static getSimple(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield User.query(`SELECT u.id, u.firstName, u.lastName, u.login, p.path as picture
			FROM ${User.tname} as u
			LEFT JOIN user_pictures as p ON p.user = u.id
			WHERE u.id = ?
			LIMIT 1`, [id]);
            if (result && result.length == 1) {
                return result[0];
            }
            return null;
        });
    }
    static create_fake_user(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield User.query('INSERT INTO `users` (`email`, `username`, `password`, `lastName`, `firstName`, `gender`, `preferences`, `biography`, `birthdate`, `location`, `verified`, `fame`, `login`) \
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_SRID(POINT(?, ?), 4326), true, ?, ?)', [
                    user.email,
                    user.username,
                    user.password,
                    user.lastName,
                    user.firstName,
                    user.gender,
                    user.preferences,
                    user.biography,
                    user.birthdate,
                    user.lng,
                    user.lat,
                    user.fame,
                    user.login,
                ]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getAllSimple(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (ids.length === 0)
                    return [];
                const users = yield User.query(`SELECT u.id, u.firstName, u.lastName, u.login, p.path as picture
				FROM ${User.tname} as u
				LEFT JOIN user_pictures as p ON p.user = u.id
				WHERE u.id IN (${new Array(ids.length).fill('?').join(',')})`, [...ids]);
                return users.map((user) => {
                    return Object.assign(Object.assign({}, user), { online: false, picture: User.mainPictureUrl(user.picture) });
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    static updateFame(id, amount) {
        return User.query(`UPDATE ${User.tname} SET fame = fame + ? WHERE id = ?`, [amount, id]);
    }
    static getPublicProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield User.query(`SELECT id, firstName, lastName, fame, gender, preferences, biography, location, birthdate, login
			FROM ${User.tname}
			WHERE id = ? LIMIT 1`, [id]);
            if (result && result.length == 1) {
                const profile = result[0];
                return Object.assign(Object.assign({}, profile), { location: Location_1.xy2ll(profile.location) });
            }
            return null;
        });
    }
    static exists(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield User.query(`SELECT id FROM ${User.tname} WHERE id = ? LIMIT 1`, [id]);
            if (result && result.length == 1)
                return true;
            return false;
        });
    }
    static updateLocation(ll) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const xy = Location_1.ll2xy(ll);
                yield User.query('UPDATE users SET location = ST_SRID(POINT(?, ?), 4326)', [xy.x, xy.y]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static changePassword(pwForm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = Object.assign({}, pwForm);
                data.password = yield bcrypt_1.default.hash(pwForm.password, 10);
                return yield User.query('UPDATE users SET password = ?', [data.password]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static updateLastLogin(id) {
        return User.query('UPDATE users SET login = NOW() WHERE id = ?', [id]);
    }
    static search(user_id, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { preferences, location, gender } = yield User.find(user_id);
                let preferences_query = '';
                if (preferences === 'heterosexual') {
                    preferences_query = `gender = '${gender === 'male' ? 'female' : 'male'}'`;
                }
                else if (preferences === 'bisexual') {
                    if (gender === 'male')
                        preferences_query = `(gender = 'female' OR (gender = 'male' AND preferences = 'bisexual'))`;
                    else
                        preferences_query = `(gender = 'male' OR (gender = 'female' AND preferences = 'bisexual'))`;
                }
                if (query.tags.length)
                    return yield User.search_with_tags(user_id, location, preferences_query, query);
                else
                    return yield User.search_without_tags(user_id, location, preferences_query, query);
            }
            catch (error) {
                throw error;
            }
        });
    }
    static common_select_query() {
        return `users.id, username, lastName, firstName, gender, preferences, birthdate, biography, location,
		uinfo.age, ROUND(uinfo.distance) AS distance, fame, upictures.path AS image,
		CONCAT(LPAD(ROUND(uinfo.distance), 5, '0'), LPAD(users.id, 5, '0')) AS distance_cursor,
		CONCAT(LPAD(IFNULL(fame, 0), 5, '0'), LPAD(users.id, 5, '0')) AS fame_cursor,
		CONCAT(LPAD(uinfo.age, 3, '0'), LPAD(users.id, 5, '0')) AS age_cursor`;
    }
    static common_join_query(languages) {
        return `
			INNER JOIN (
				SELECT id AS user, ST_Distance_Sphere(location, ST_GeomFromText('POINT(? ?)', 4326))/1000 AS distance, timestampdiff(YEAR, birthdate, CURDATE()) AS age
				FROM users
			) AS uinfo
			ON users.id = uinfo.user
			INNER JOIN (
				SELECT user_pictures.user, user_pictures.path
				FROM user_pictures
				WHERE user_pictures.picture = 0
			) AS upictures
			ON users.id = upictures.user
			INNER JOIN (
				SELECT user_languages.user, user_languages.language
				FROM user_languages
				WHERE user_languages.language IN (${new Array(languages.length).fill('?').join(',')})
			) AS ulangs
			ON users.id = ulangs.user`;
    }
    static cursor_query({ scroll, cursor, sort, sort_dir }) {
        const dir = sort_dir === 'ASC' ? '>' : '<';
        let s = '';
        if (sort === 'distance_cursor') {
            s = `CONCAT(LPAD(ROUND(uinfo.distance), 5, '0'), LPAD(users.id, 5, '0'))`;
        }
        else if (sort === 'fame_cursor') {
            s = `CONCAT(LPAD(fame, 5, '0'), LPAD(users.id, 5, '0'))`;
        }
        else if (sort === 'age_cursor') {
            s = `CONCAT(LPAD(uinfo.age, 3, '0'), LPAD(users.id, 5, '0'))`;
        }
        return scroll ? `AND ${s} ${dir} ${cursor}` : ``;
    }
    static search_without_tags(user_id, location, preferences_query, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { distance, age, fame, sort, sort_dir, languages, mode } = query;
            return yield User.query(`SELECT ${User.common_select_query()}
					FROM users
					${User.common_join_query(languages)}
					WHERE users.id != ?
						AND ${preferences_query} AND distance < ?
						AND age >= ? AND age <= ?
						${User.invalid_user_filter_query}
						AND fame >= ? AND fame <= ?
						${User.cursor_query(query)}
					ORDER BY ${sort} ${sort_dir}
					LIMIT ${mode === 'image' ? 12 : 30}`, [location.y, location.x, ...languages, user_id, distance, age[0], age[1], fame[0], fame[1]]);
        });
    }
    static search_with_tags(user_id, location, preferences_query, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { distance, age, fame, sort, sort_dir, tags, languages, mode } = query;
            return yield User.query(`SELECT ${User.common_select_query()},
				utags.tag_list,
				LENGTH(utags.tag_list) - LENGTH(REPLACE(utags.tag_list, ',', '')) + 1 AS number_of_common_tags,
				CONCAT(LPAD(LENGTH(utags.tag_list) - LENGTH(REPLACE(utags.tag_list, ',', '')) + 1, 3, '0'), LPAD(users.id, 5, '0')) AS tag_cursor
				FROM users
				${User.common_join_query(languages)}
				LEFT JOIN (
					SELECT user, group_concat(IF(tags.name IN (${new Array(tags.length).fill('?').join(',')}), tags.name, NULL)) as tag_list
					FROM user_tags
					LEFT JOIN tags
					ON user_tags.tag = tags.id
					GROUP BY user
				) AS utags
				ON users.id = utags.user
				WHERE users.id != ?
					AND ${preferences_query} AND distance < ?
					AND age >= ? AND age <= ?
					AND tag_list IS NOT NULL
					${User.invalid_user_filter_query}
					AND fame >= ? AND fame <= ?
					${User.cursor_query(query)}
				ORDER BY ${sort} ${sort_dir}
				LIMIT ${mode === 'image' ? 12 : 30}`, [location.y, location.x, ...languages, ...tags, user_id, distance, age[0], age[1], fame[0], fame[1]]);
        });
    }
}
User.tname = 'users';
User.table = `CREATE TABLE users (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(60) NOT NULL,
			username VARCHAR(30) NOT NULL,
			password VARCHAR(100) NOT NULL,
			firstName VARCHAR(45) NOT NULL,
			lastName VARCHAR(45) NOT NULL,
			verified TINYINT DEFAULT '0',
			initialized TINYINT DEFAULT '0',
			fame INT UNSIGNED DEFAULT '0',
			gender ENUM('male','female') DEFAULT NULL,
			preferences ENUM('heterosexual','bisexual') DEFAULT NULL,
			biography TEXT DEFAULT NULL,
			location POINT SRID 4326 NOT NULL,
			birthdate DATETIME DEFAULT NULL,
			login DATETIME DEFAULT NULL,
			provider VARCHAR(10) DEFAULT 'local',
			provider_id VARCHAR(255) DEFAULT NULL,
			UNIQUE KEY email_UNIQUE (email),
			UNIQUE KEY username_UNIQUE (username)
		) ENGINE=InnoDB DEFAULT CHARSET=${MySQL_1.default.CHARSET} COLLATE=${MySQL_1.default.COLLATION}`;
User.invalid_user_filter_query = `AND users.verified = 1
		AND users.gender IS NOT NULL
		AND users.preferences IS NOT NULL
		AND users.birthdate IS NOT NULL
		AND users.biography IS NOT NULL`;
exports.default = User;
//# sourceMappingURL=User.js.map