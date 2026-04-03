const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.cookies?.jwt;
    if (!token) return res.status(401).redirect('/auth/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Now req.user.userId is available in every route
        next();
    } catch (err) {
        res.clearCookie('jwt');
        res.redirect('/auth/login');
    }
};

module.exports = authMiddleware;