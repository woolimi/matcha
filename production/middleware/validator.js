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
const lodash_1 = __importDefault(require("lodash"));
const languages_1 = __importDefault(require("../init/languages"));
const User_1 = __importDefault(require("../models/User"));
const age_calculator_1 = require("@dipaktelangre/age-calculator");
function validate_email(email, option = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(String(email).toLowerCase()))
            return 'Invalid email format';
        if (option && option.prev_email === email)
            return '';
        const rows = yield User_1.default.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
        if (rows.length !== 0)
            return 'email is already taken';
        return '';
    });
}
function validate_username(username) {
    if (username.length === 0)
        return 'username is required';
    else if (username.length < 4 || username.length > 30)
        return 'username must be between 4 to 30 letters.';
    return '';
}
function validate_firstName(firstName) {
    if (firstName.length === 0)
        return 'first name is required';
    else if (firstName.length > 45)
        return 'Name must be less than 45 letters';
    return '';
}
function validate_lastName(lastName) {
    if (lastName.length === 0)
        return 'last name is required';
    else if (lastName.length > 45)
        return 'Name must be less than 45 letters';
    return '';
}
function validate_password(password) {
    if (password.length === 0)
        return 'password required';
    if (password.length < 8)
        return 'Password must be at least 8 characters long';
    if (password.length > 100)
        return 'Password must be at most 100 characters long';
    return '';
}
function validate_vpassword(password, vpassword) {
    if (password !== vpassword)
        return 'Passwords does not match';
    return '';
}
function validate_languages(languages) {
    if (!languages.length)
        return 'languages are required';
    if (languages.length > 3)
        return 'languages are at most 3';
    for (const lang of languages) {
        if (!languages_1.default.has(lang))
            return `Invalid language '${lang}'`;
    }
    return '';
}
function validate_gender(gender) {
    if (!gender)
        return 'gender is required';
    if (gender !== 'male' && gender !== 'female')
        return 'Invalid gender';
    return '';
}
function validate_preferences(preferences) {
    if (!preferences)
        return 'preference is required';
    if (preferences !== 'heterosexual' && preferences !== 'bisexual')
        return 'Invalid preference';
    return '';
}
function validate_tags(tags) {
    if (!tags.length)
        return 'interest tags are required';
    if (tags.length > 5)
        return 'interest tags are at most 5';
    return '';
}
function validate_biography(biography) {
    if (!biography.length)
        return 'biography is required';
    if (biography.length > 150)
        return 'Too long';
    return '';
}
function validate_birthdate(birthdate) {
    if (!birthdate)
        return 'birthdate is required';
    if (age_calculator_1.AgeCalculator.getAgeIn(new Date(birthdate), 'years') < 18)
        return 'You must be at least 18 years old';
    return '';
}
function fieldsChecker(formData, expectedFields) {
    const foundFields = [];
    for (const field of Object.keys(formData)) {
        if (expectedFields.indexOf(field) < 0) {
            console.error(`Invalid field ${field}.`);
            return false;
        }
        else
            foundFields.push(field);
    }
    if (expectedFields.length != foundFields.length) {
        console.error(`Missing parameters.`);
        return false;
    }
    return true;
}
exports.default = {
    userRegister(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.body;
                if (!fieldsChecker(user, [
                    'email',
                    'username',
                    'firstName',
                    'lastName',
                    'password',
                    'vpassword',
                    'location',
                ]))
                    return res.sendStatus(400);
                const error = {};
                let e_msg = '';
                e_msg = yield validate_email(user.email);
                if (e_msg)
                    error.email = e_msg;
                e_msg = validate_username(user.username);
                if (e_msg)
                    error.username = e_msg;
                e_msg = validate_firstName(user.firstName);
                if (e_msg)
                    error.firstName = e_msg;
                e_msg = validate_lastName(user.lastName);
                if (e_msg)
                    error.lastName = e_msg;
                e_msg = validate_password(user.password);
                if (e_msg)
                    error.password = e_msg;
                e_msg = validate_vpassword(user.password, user.vpassword);
                if (e_msg)
                    error.vpassword = e_msg;
                if (!lodash_1.default.isEmpty(error)) {
                    return res.json({ error });
                }
                next();
            }
            catch (error) {
                console.error(error);
                return res.sendStatus(500);
            }
        });
    },
    userLogin(req, res, next) {
        const user = req.body;
        if (!fieldsChecker(user, ['username', 'password']))
            return res.sendStatus(400);
        next();
    },
    userEmailVerification(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                if (!fieldsChecker(data, ['email', 'prev_email']))
                    return res.sendStatus(400);
                const error = {};
                let e_msg = '';
                e_msg = yield validate_email(data.email, { prev_email: data.prev_email });
                if (e_msg)
                    error.email = e_msg;
                if (!lodash_1.default.isEmpty(error))
                    return res.json({ error });
                next();
            }
            catch (error) {
                console.error(error);
                res.sendStatus(500);
            }
        });
    },
    userLocation(req, res, next) {
        const location = req.body;
        if (lodash_1.default.isObject(location) && location.hasOwnProperty('lat') && location.hasOwnProperty('lng'))
            next();
        else
            return res.sendStatus(400);
    },
    userPictures(req, res, next) {
        const { user_id, image_id } = req.params;
        if (req.user.id !== Number(user_id))
            return res.sendStatus(403);
        if (Number(image_id) < 0 || Number(image_id) > 4)
            return res.sendStatus(403);
        next();
    },
    userPublic(req, res, next) {
        const user = req.body;
        if (!fieldsChecker(user, [
            'username',
            'firstName',
            'lastName',
            'languages',
            'gender',
            'preferences',
            'tags',
            'biography',
            'birthdate',
        ]))
            return res.sendStatus(400);
        const error = {};
        let e_msg = '';
        e_msg = validate_username(user.username);
        e_msg = error.username;
        e_msg = validate_firstName(user.firstName);
        if (e_msg)
            error.firstName = e_msg;
        e_msg = validate_lastName(user.lastName);
        if (e_msg)
            error.lastName = e_msg;
        e_msg = validate_languages(user.languages);
        if (e_msg)
            error.languages = e_msg;
        e_msg = validate_gender(user.gender);
        if (e_msg)
            error.gender = e_msg;
        e_msg = validate_preferences(user.preferences);
        if (e_msg)
            error.preferences = e_msg;
        e_msg = validate_tags(user.tags);
        if (e_msg)
            error.tags = e_msg;
        e_msg = validate_biography(user.biography);
        if (e_msg)
            error.biography = e_msg;
        e_msg = validate_birthdate(user.birthdate);
        if (e_msg)
            error.birthdate = e_msg;
        if (!lodash_1.default.isEmpty(error))
            return res.json({ error });
        next();
    },
    userChangePassword(req, res, next) {
        const pwForm = req.body;
        const error = {};
        let e_msg = '';
        e_msg = validate_password(pwForm.password);
        if (e_msg)
            error.password = e_msg;
        e_msg = validate_vpassword(pwForm.password, pwForm.vpassword);
        if (e_msg)
            error.vpassword = e_msg;
        if (!lodash_1.default.isEmpty(error))
            return res.json({ error });
        next();
    },
    searchQuery(req, res, next) {
        const bef_query = req.query;
        const query = Object.assign(Object.assign({}, bef_query), { age: bef_query.age.map((s) => parseInt(s)), fame: bef_query.fame.map((s) => parseInt(s)), distance: parseInt(bef_query.distance), scroll: bef_query.scroll === 'true' ? true : false });
        if (!query.tags)
            query.tags = [];
        if (!fieldsChecker(query, [
            'age',
            'distance',
            'fame',
            'tags',
            'sort',
            'sort_dir',
            'languages',
            'scroll',
            'cursor',
            'mode',
        ]))
            return res.sendStatus(400);
        if (!query)
            return res.sendStatus(400);
        if (query.age.length !== 2 || query.age[0] < 0)
            return res.sendStatus(400);
        if (query.distance < 0)
            return res.sendStatus(400);
        if (query.fame.length !== 2 || query.fame[0] < 0)
            return res.sendStatus(400);
        if (query.tags.length > 10)
            return res.sendStatus(400);
        if (query.sort_dir !== 'ASC' && query.sort_dir !== 'DESC')
            return res.sendStatus(400);
        if (query.languages.length === 0)
            return res.sendStatus(400);
        if (query.mode !== 'map' && query.mode !== 'image')
            return res.sendStatus(400);
        if (query.age[1] >= 50)
            query.age[1] = Number.MAX_SAFE_INTEGER;
        if (query.distance >= 100)
            query.distance = Number.MAX_SAFE_INTEGER;
        if (query.fame[1] >= 50)
            query.fame[1] = Number.MAX_SAFE_INTEGER;
        req.query = query;
        next();
    },
};
//# sourceMappingURL=validator.js.map