const registerUser = require('./register/index');
const uploadContacts = require('./uploadContacts/index');
const markSpam = require('./markSpam/index');
const searchUser = require('./searchUser/index');
const login = require('./login/index');

module.exports = {
    registerUser,
    uploadContacts,
    markSpam,
    searchUser,
    login
}
