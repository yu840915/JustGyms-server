const { firebaseAdmin } = require('./firebaseAdmin');

const auth = firebaseAdmin.auth();

const authenticate = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    return res.sendStatus(403);
  }

  const token = req.headers.authorization.split('Bearer ')[1];
  try {
    const jwt = await auth.verifyIdToken(token);
    req.jwt = jwt;
    req.userId = jwt.uid;
    return next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

module.exports = {
  authenticate,
};
