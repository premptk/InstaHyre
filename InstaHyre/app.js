// .env
const dotenv = require('dotenv-safe');
dotenv.config({
  allowEmptyValues: true
});
const PORT = process.env.PORT;

const express = require('express');
const cors = require('cors');
const rTracer = require('cls-rtracer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());
app.use(rTracer.expressMiddleware());

const {logger, middlewareLogger} = require('./helper/logging/logger');

// main
const apiV1 = require('./src/api/route.v1');
app.use('/api/v1/',apiV1);

// healthcheck
app.get('/app/health', (request, reply) => {
  reply.status(200).send({ statusCode: '200', message: 'ok' });
});

// Start Server
app.listen(PORT, () => logger.info(`directory listening on port ${PORT}!`));


