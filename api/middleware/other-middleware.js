const Users = require('../users/users-model');
const jwt = require('jsonwebtoken');

const validateRegistrationPayload = (request, response, next) => {
    const { username, password } = request.body;
    if (!username || !password ) {
        next({ status: 400, message: 'username and password required' });
    } else {
        next();
    }
};

const checkUsernameAvailable = async (request, response, next) => {
    try {
        const user = await Users.findBy({ username: request.body.username });
        if (user) {
            next({ status: 400, message: 'username taken' });
        } else {
            next();
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { validateRegistrationPayload, checkUsernameAvailable };