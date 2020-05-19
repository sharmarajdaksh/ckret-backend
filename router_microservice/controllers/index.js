const { promisify } = require('util');

const axios = require('axios');
const jwt = require('jsonwebtoken');

const AUTH_URL = `http://${process.env.AUTH_URL}:${process.env.AUTH_PORT}`;
const SECRETS_URL = `http://${process.env.SECRETS_URL}:${process.env.SECRETS_PORT}`;
const JWT_SECRET = process.env.JWT_SECRET;

const redisClient = require('../redis');
const hgetAsync = promisify(redisClient.hget).bind(redisClient);

const generateToken = (username) => {
	const timestamp = new Date().getTime();

	// sub is the subject; iat is the issued at time
	return jwt.sign({ sub: username, iat: timestamp }, JWT_SECRET);
};

exports.login = (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(422)
			.json({ message: 'You must provide a username and password' });
	}

	axios
		.post(AUTH_URL + '/login', {
			username,
			password,
		})
		.then((response) => {
			if (response.status !== 200) {
				return next(new Error(response));
			}

			if (response.data.message === 'Invalid username or password') {
				return res.status(423).json({
					message: 'Invalid username or password',
				});
			}

			token = generateToken(username);

			res.status(200).json({ message: 'Login successful', token });

			redisClient.hset(username, 'token', token);
			redisClient.expire(username, 3600 * 3); // Expire in 3 hours
		})
		.catch((err) => {
			next(err);
		});
};

exports.signup = (req, res, next) => {
	const { username, password, confirmPassword } = req.body;

	if (password !== confirmPassword) {
		return res.status(422).json({ message: 'Passwords do not match' });
	}

	if (!username || !password) {
		return res
			.status(422)
			.json({ message: 'You must provide a username and password' });
	}

	axios
		.post(AUTH_URL + '/signup', {
			username,
			password,
			confirmPassword,
		})
		.then((response) => {
			if (response.status !== 201 && response.status !== 200) {
				return next(new Error(response));
			}

			if (response.data.message === 'Username taken') {
				return res.status(421).json({
					message: 'Username taken',
				});
			}

			const token = generateToken(username);

			res.status(201).json({ message: 'New user created', token });

			redisClient.hset(username, 'token', token);
			redisClient.expire(username, 3600 * 3); // Expire in 3 hours
		})
		.catch((err) => {
			next(err);
		});
};

exports.getSecrets = (req, res, next) => {
	const username = req.params.username;

	hgetAsync(username, 'secrets')
		.then((secrets) => {
			if (secrets) {
				return res.status(200).json(JSON.parse(secrets));
			}

			return axios.get(SECRETS_URL + '/' + username).then((response) => {
				res.status(200).json(response.data);

				redisClient.hset(
					username,
					'secrets',
					JSON.stringify(response.data)
				);
			});
		})
		.catch((err) => {
			console.log(err);
			next(err);
		});
};

exports.addSecret = (req, res, next) => {
	const username = req.params.username;
	const { key, value } = req.body;

	if (!key || !value) {
		return res.status(422).json({
			message: 'You must provide a key and value for a secret',
		});
	}

	axios
		.post(SECRETS_URL + '/' + username, { key, value })
		.then((response) => {
			res.status(200).json(response.data);

			redisClient.hdel(username, 'secrets');
		})
		.catch((err) => {
			next(err);
		});
};

exports.updateSecret = (req, res, next) => {
	const username = req.params.username;
	const secretId = req.params.secretId;

	const { key, value } = req.body;

	axios
		.put(SECRETS_URL + '/' + username + '/' + secretId, { key, value })
		.then((response) => {
			res.status(200).json(response.data);

			redisClient.hdel(username, 'secrets');
		})
		.catch((err) => {
			if (err.response.status === 404) {
				return res.status(404).json({
					message:
						'Secret for the current user with passed id not found',
				});
			}
			next(err);
		});
};

exports.updateSecret = (req, res, next) => {
	const username = req.params.username;
	const secretId = req.params.secretId;

	const { key, value } = req.body;

	axios
		.put(SECRETS_URL + '/' + username + '/' + secretId, { key, value })
		.then((response) => {
			res.status(200).json(response.data);

			redisClient.hdel(username, 'secrets');
		})
		.catch((err) => {
			if (err.response.status === 404) {
				return res.status(404).json({
					message:
						'Secret for the current user with passed id not found',
				});
			}
			if (err.response.status === 403) {
				return res.status(403).json({
					message: 'Unauthorized',
				});
			}
			next(err);
		});
};

exports.deleteSecret = (req, res, next) => {
	const username = req.params.username;
	const secretId = req.params.secretId;

	axios
		.delete(SECRETS_URL + '/' + username + '/' + secretId)
		.then((response) => {
			res.status(200).json(response.data);

			redisClient.hdel(username, 'secrets');
		})
		.catch((err) => {
			if (err.response.status === 404) {
				return res.status(404).json({
					message:
						'Secret for the current user with passed id not found',
				});
			}
			if (err.response.status === 403) {
				return res.status(403).json({
					message: 'Unauthorized',
				});
			}
			next(err);
		});
};
