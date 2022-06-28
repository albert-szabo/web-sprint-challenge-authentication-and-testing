const router = require('express').Router();
const { validatePayload, checkUsernameAvailable, checkUsernameExists } = require('../middleware/other-middleware');
const Users = require('../users/users-model');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../secrets/index');
const jwt = require('jsonwebtoken');

/*
  IMPLEMENT
  You are welcome to build additional middlewares to help with the endpoint's functionality.
  DO NOT EXCEED 2^8 ROUNDS OF HASHING!

  1- In order to register a new account the client must provide `username` and `password`:
    {
      "username": "Captain Marvel", // must not exist already in the `users` table
      "password": "foobar"          // needs to be hashed before it's saved
    }

  2- On SUCCESSFUL registration,
    the response body should have `id`, `username` and `password`:
    {
      "id": 1,
      "username": "Captain Marvel",
      "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
    }

  3- On FAILED registration due to `username` or `password` missing from the request body,
    the response body should include a string exactly as follows: "username and password required".

  4- On FAILED registration due to the `username` being taken,
    the response body should include a string exactly as follows: "username taken".
*/

router.post('/register', validatePayload, checkUsernameAvailable, (request, response, next) => {
  const { username, password } = request.body;
  const hash = bcrypt.hashSync(password, 8);
  Users.add({ username, password: hash })
    .then(newUser => {
      response.status(201).json(newUser);
    })
    .catch(next);
});

/*
  IMPLEMENT
  You are welcome to build additional middlewares to help with the endpoint's functionality.

  1- In order to log into an existing account the client must provide `username` and `password`:
    {
      "username": "Captain Marvel",
      "password": "foobar"
    }

  2- On SUCCESSFUL login,
    the response body should have `message` and `token`:
    {
      "message": "welcome, Captain Marvel",
      "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
    }

  3- On FAILED login due to `username` or `password` missing from the request body,
    the response body should include a string exactly as follows: "username and password required".

  4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
    the response body should include a string exactly as follows: "invalid credentials".
*/

router.post('/login', validatePayload, checkUsernameExists, (request, response, next) => {
  const passwordMatch = bcrypt.compareSync(request.body.password, request.user.password);
  if (passwordMatch) {
    const token = createToken(request.user);
    response.json({
      message: `welcome, ${request.user.username}`,
      token
    });
  } else {
    next({ status: 401, message: 'invalid credentials' });
  }
});

function createToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username
  };
  const options = {
    expiresIn: '5m'
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
