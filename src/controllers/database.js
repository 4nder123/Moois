const fs = require('fs');
const path = require('path');
const nodeCron = require('node-cron');

nodeCron.schedule("0 0 0 * * *", () => {
    const userdb = usersDB();
    userdb.users.forEach(user => {
        if (user.token && Array.isArray(user.token)) {
            user.token = user.token.filter(token => {
                try {
                    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
                    return true;
                } catch (err) {
                    return false;
                }
            });
        }
    });
    fs.writeFileSync(path.join(__dirname, '../../database/users.json'), JSON.stringify(userdb.users, null, 2));
});

const usersDB = () => {
    return { "users": JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/users.json')))};
};

const findUserById = (id) => {
    return usersDB().users.find(person => person.id === id);
};

const findUserByEmail = (email) => {
    return usersDB().users.find(person => person.user === email);
};

const findUserByToken = (token) => {
    return usersDB().users.find(person => person.token.includes(token));
};

const getUserEventData = function(id){
    if (fs.existsSync(path.join(__dirname, '../../database/user-saved-info/'+id+'.json'))) {
        return fs.readFileSync(path.join(__dirname, '../../database/user-saved-info/'+id+'.json')).toString()
    }
    else{
        return '{"done": [], "highlight":[], "events":[]}'
    }
}

const createUser = (email, password) => {
    const db = usersDB();
    const users = db.users;
    const newUser = {
        id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
        user: email,
        password: password,
        moodle: "",
        ois: "",
        allow: 0,
        token: [],
        pohivaade: "tunniplaan"
    };
    users.push(newUser);
    fs.writeFileSync(path.join(__dirname, '../../database/users.json'), JSON.stringify(users, null, 2));
};

const saveUserInfo = (user) => {
    const db = usersDB();
    const users = db.users;
    const existingUserIndex = users.findIndex(existingUser => existingUser.id === user.id);
    if (existingUserIndex !== -1) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    fs.writeFileSync(path.join(__dirname, '../../database/users.json'), JSON.stringify( users , null, 2));
};

const updateUserEventData = async function(id, isDone, isHigh, userEvents) {
    const filePath = path.join(__dirname, '../../database/user-saved-info/', `${id}.json`);
    const userData = JSON.stringify({
        done: isDone,
        highlight: isHigh,
        events: userEvents,
    });
    try {
        await fs.promises.writeFile(filePath, userData);
    } catch (error) {
        console.log('Error writing to file:', error);
    }
};

module.exports = { findUserById, findUserByEmail, saveUserInfo, findUserByToken, getUserEventData, updateUserEventData, createUser }