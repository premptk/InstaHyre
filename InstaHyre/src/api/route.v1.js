const express = require('express');
const router = express.Router();
const { logger } = require('../../helper/logging/logger');
const { isuser } = require('./../helper/auth.v1');

// Import handler files
const {
    registerUser,
    login,
    uploadContacts,
    markSpam,
    searchUser
} = require('./export');

/**
 * SuccessHandler handle correct response
 * @param {{}} response
 * @param {Function} res
 */
const successhandler = (response, res) => {
  let responseData = {};
  responseData.status = 200;
  responseData.data = response;
  res.send(responseData);
};

/**
 * failurehandler handle fail response
 * @param {{}} error
 * @param {Function} res
 */
const failurehandler = (error, res) => {
  let errorResponse = {};
  errorResponse.error = error.error || 'APIError';
  errorResponse.code = error.code || 500;
  errorResponse.message = error.message || 'Something went wrong';
  res.status(errorResponse.code).send(errorResponse);
};

router.post('/register', (req, res) => {
  registerUser.handler(logger, req)
    .then((result) => successhandler(result, res))
    .catch((err) => failurehandler(err, res));
});

router.post('/login', (req, res) => {
  login.handler(logger, req)
    .then((result) => successhandler(result, res))
    .catch((err) => failurehandler(err, res));
});

router.post('/upload-contacts', isuser, (req, res) => {
  uploadContacts.handler(logger, req)
  .then((result) => successhandler(result, res))
  .catch((err) => failurehandler(err, res));
});

router.post('/mark-spam', isuser, (req, res) => {
  markSpam.handler(logger, req)
  .then((result) => successhandler(result, res))
  .catch((err) => failurehandler(err, res));
});

router.post('/search', isuser, (req, res) => {
  searchUser.handler(logger, req)
  .then((result) => successhandler(result, res))
  .catch((err) => failurehandler(err, res));
})


module.exports = router;