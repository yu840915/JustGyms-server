const { firebaseAdmin } = require('./firebaseAdmin');
const { firestoreRefs } = require('./user');
const auth = firebaseAdmin.auth();

const verifyIdToken = async (req, res, next) => {
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

const authenticate = async (req, res, next) => {
  await verifyIdToken(req, res, async () => {
    const user = await auth.getUser(req.jwt.uid);
    if (user.providerData.length > 0) {
      req.userRef = firestoreRefs.usersRef.doc(user.uid);
      return next();
    }
    return res.sendStatus(403);
  });
};

module.exports = {
  authenticate,
  verifyIdToken,
};
