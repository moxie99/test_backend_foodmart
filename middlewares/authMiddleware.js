const jwt = require('jsonwebtoken');

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;
  console.log('11122233343444', accessToken);
  console.log('00000000', req.cookies);
  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized: Please log in' });
  } else {
    try {
      const decodeToken = await jwt.verify(accessToken, process.env.JWT_SECRET);
      req.role = decodeToken.role;
      req.id = decodeToken.id;
      next();
    } catch (error) {
      return res.status(409).json({ error: 'Please log in' });
    }
  }
};
