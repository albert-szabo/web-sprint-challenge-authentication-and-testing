const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index');

/*
  IMPLEMENT

  1- On valid token in the Authorization header, call next.

  2- On missing token in the Authorization header,
    the response body should include a string exactly as follows: "token required".

  3- On invalid or expired token in the Authorization header,
    the response body should include a string exactly as follows: "token invalid".
*/

module.exports = (request, response, next) => {
  const token = request.headers.authorization;
  if (!token) {
    return next({ status: 401, message: 'token required' });
  }
  jwt.verify(token, JWT_SECRET, (error, decodedToken) => {
    if (error) {
      next({ status: 401, message: 'token invalid' });
    } else {
      request.decodedToken = decodedToken;
      next();
    }
  })
};
