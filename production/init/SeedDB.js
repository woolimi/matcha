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
const User_1 = __importDefault(require("../models/User"));
const UserPicture_1 = __importDefault(require("../models/UserPicture"));
const Tag_1 = __importDefault(require("../models/Tag"));
const Genders_json_1 = __importDefault(require("./Genders.json"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Model_1 = __importDefault(require("../models/Model"));
const faker_1 = __importDefault(require("faker"));
const UserTag_1 = __importDefault(require("../models/UserTag"));
const UserLanguage_1 = __importDefault(require("../models/UserLanguage"));
const UserLike_1 = __importDefault(require("../models/UserLike"));
const UserReport_1 = __importDefault(require("../models/UserReport"));
faker_1.default.locale = 'en';
function create_seed_tags() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Tag_1.default.add('vegan');
            yield Tag_1.default.add('geek');
            yield Tag_1.default.add('piercing');
            yield Tag_1.default.add('sports');
            yield Tag_1.default.add('climbing');
            yield Tag_1.default.add('ecole42');
            yield Tag_1.default.add('photography');
            yield Tag_1.default.add('dog');
            yield Tag_1.default.add('cat');
            yield Tag_1.default.add('sns');
            console.log('Tag created');
        }
        catch (error) {
            throw error;
        }
    });
}
const genderArr = ['female', 'male'];
function get_random(min, max, not = null) {
    if (not) {
        let selected;
        do {
            selected = Math.floor(Math.random() * (max + 1) + min);
        } while (not === selected);
        return selected;
    }
    else
        return Math.floor(Math.random() * (max + 1) + min);
}
function create_seed_users() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield User_1.default.query('SELECT * FROM users COUNT');
            if (users.length >= 500) {
                console.log('Seed user already created');
                return;
            }
            const password = yield bcrypt_1.default.hash('asdfasdf', 10);
            const current_year = new Date().getFullYear();
            const tags = yield Tag_1.default.get_tag_ids();
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
            const unique_pairs = [];
            const unique_emails = [];
            for (let i = 0; i < 500; i++) {
                let lastName, firstName, username, email;
                const lng = faker_1.default.random.number({ min: 2.107361, max: 2.489544, precision: 0.0001 });
                const lat = faker_1.default.random.number({ min: 48.775862, max: 48.957325, precision: 0.0001 });
                do {
                    lastName = faker_1.default.name.lastName(Genders_json_1.default[i]);
                    firstName = faker_1.default.name.firstName(Genders_json_1.default[i]);
                    username = `${lastName}.${firstName}`;
                    email = faker_1.default.internet.email();
                } while (unique_pairs.indexOf(username) >= 0 || unique_emails.indexOf(email) >= 0);
                unique_pairs.push(username);
                unique_emails.push(email);
                const gender = i < 70 ? genderArr[Genders_json_1.default[i]] : genderArr[get_random(0, 1)];
                const user = {
                    email: faker_1.default.internet.email(),
                    username,
                    password,
                    lastName,
                    firstName,
                    gender,
                    preferences: Math.floor(Math.random() * 6) === 1 ? 'bisexual' : 'heterosexual',
                    biography: faker_1.default.hacker.phrase(),
                    birthdate: faker_1.default.date.between(new Date(String(current_year - 50)), new Date(String(current_year - 18))),
                    lng,
                    lat,
                    fame: get_random(0, 100),
                    login: new Date(Date.now() - 3600 * 24 * 1000 * Math.floor(Math.random() * 10)),
                };
                const { insertId } = yield User_1.default.create_fake_user(user);
                const randomTagId = Math.floor(Math.random() * tags.length);
                if (i < 70)
                    yield UserPicture_1.default.create_or_update(insertId, 0, `https://i.pravatar.cc/300?img=${i + 1}`);
                else
                    yield UserPicture_1.default.create_or_update(insertId, 0, `https://picsum.photos/seed/${username}/300/300`);
                yield UserTag_1.default.add_tag(insertId, tags[randomTagId]);
                yield UserTag_1.default.add_tag(insertId, tags[(randomTagId + 1) % tags.length]);
                yield UserLanguage_1.default.add(insertId, langs[Math.floor(Math.random() * langs.length)]);
            }
            console.log('Fake user seed created');
        }
        catch (error) {
            throw error;
        }
    });
}
function create_seed_user_likes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ulikes = yield UserLike_1.default.query('SELECT * FROM user_likes COUNT');
            if (ulikes.length >= 300)
                return console.log('user_likes seed already created');
            let prv = 1;
            for (let i = 0; i < 500; i++) {
                let nxt = get_random(1, 500, prv);
                yield UserLike_1.default.query('INSERT IGNORE INTO user_likes (user, liked) VALUES (?, ?)', [prv, nxt]);
                prv = nxt;
            }
            console.log('user_likes seed created');
        }
        catch (error) {
            throw error;
        }
    });
}
function create_seed_user_reports() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ureports = yield UserReport_1.default.query('SELECT * FROM user_reports COUNT');
            if (ureports.length >= 5)
                return console.log('user_reports seed already created');
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 50]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [2, 50]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [3, 50]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 49]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [2, 49]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [3, 48]);
            yield UserReport_1.default.query('INSERT INTO user_reports (user, reported) VALUES (?, ?)', [1, 48]);
            console.log('user_reports seed created');
        }
        catch (error) {
            throw error;
        }
    });
}
function create_seed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Model_1.default.query('START TRANSACTION');
            yield create_seed_tags();
            yield create_seed_users();
            yield Model_1.default.query('COMMIT');
            process.exit();
        }
        catch (error) {
            console.error(error);
            yield Model_1.default.query('ROLLBACK');
            process.exit();
        }
    });
}
create_seed();
//# sourceMappingURL=SeedDB.js.map