const { logger } = require('../../helper/logging/logger');
const jwt = require("jsonwebtoken");
const { Users } = require('./../classes/users')

/**
 * Public API Access By the User
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 *  401: AuthorizatonError
 *  403: ForbiddenError
 */
const isuser = async (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; 
    const mysecretkey = process.env.SECRET_CODE;

    try {
        const decoded = jwt.verify(token, mysecretkey);
        const res = await new Users().getUserByNameNumber(console, {name: decoded.name, number: decoded.number});
        if(res.length){
            req.user = {
                id : res[0].id,
                name: res[0].name,
                number: res[0].number
            }
            return next();
        }

        let errorResponse = {
            error: 'AuthorizationError',
            code: 401,
            message: 'Please login as a verified customer',
        };
        return res.status(errorResponse.code).send(errorResponse);
    }catch (error) {
        let errorResponse = {
            error: 'ForbiddenError',
            code: 403,
            message: 'Resource Forbidden',
          };
          return res.status(errorResponse.code).send(errorResponse);
    }
}

module.exports = {
    isuser
  };