const express = require('express');
const { asyncRequestHandler } = require('../../firebaseFunctions');
const app = express();
const { authenticate } = require('../../authenticate');
const { addUserRoles, removeUserRoles } = require('./roles');
const validationRules = require('./validationRules');
const validator = require('express-joi-validation').createValidator();
const RoleChecker = require('../../roleChecker');

const requireAdmin = new RoleChecker(['admin']).checkRolesMiddleware;

app.put(
  '/:userId/roles',
  validator.params(validationRules.userId),
  validator.query(validationRules.roles),
  authenticate,
  requireAdmin,
  asyncRequestHandler(async (req, res) => {
    const { val: roles } = req.query;
    console.log(roles);
    await addUserRoles({ userId: req.params.userId, roles });
    res.sendStatus(200);
  })
);

app.delete(
  '/:userId/roles',
  validator.params(validationRules.userId),
  validator.query(validationRules.roles),
  authenticate,
  requireAdmin,
  asyncRequestHandler(async (req, res) => {
    const { val: roles } = req.query;
    await removeUserRoles({ userId: req.params.userId, roles });
    res.sendStatus(204);
  })
);

module.exports = app;
