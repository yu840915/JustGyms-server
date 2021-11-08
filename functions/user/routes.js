const express = require('express');
const { deleteAnonymousUser } = require('./deleteUser');

app.delete(
  '/:anonymousId',
  authenticate,
  asyncRequestHandler(async (req, res) => {
    const { anonymousId } = req.params;
    await deleteAnonymousUser(anonymousId);
    res.send(204);
  })
);
