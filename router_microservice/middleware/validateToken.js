const { promisify } = require('util');

const redisClient = require('../redis');
const hgetAsync = promisify(redisClient.hget).bind(redisClient);

module.exports = (req, res, next) => {
    const username = req.params.username;
    const token = req.headers.authorization;

	hgetAsync(username, 'token')
		.then((fetchedToken) => {

			if (!fetchedToken || token !== fetchedToken) {
				return res.status(403).send('Invalid or expired auth token');
			}
			return next();
		})
		.catch((err) => {
			next(err);
		});
};
