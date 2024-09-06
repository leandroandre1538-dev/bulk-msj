import jws from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const authRequired = (req, res, next) => {
    const { token } = req.cookies

    if (!token) {
        return res.status(401).json({ message: 'No toke, authorization denied' });
    }

    jws.verify(token, TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });

        req.user = user;

        next();
    });

};