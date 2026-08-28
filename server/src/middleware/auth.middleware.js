const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'campusaum_secret_key_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Provide default fallback user for dev demo
    req.user = {
      id: 'usr-admin-01',
      email: 'admin@campusaum.edu',
      role: 'ORGANIZATION_ADMIN',
      organizationId: req.tenant?.organizationId || 'org-apex-01',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

module.exports = authenticate;
