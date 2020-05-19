const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.login = (req, res, next) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(422)
			.json({ message: 'You must provide a username and password' });
	}

	User.findByPk(username)
		.then((user) => {
			if (!user) {
				return res.status(200).json({
					message: 'Invalid username or password',
				});
			}

			bcrypt.compare(password, user.password).then((match) => {
				if (!match) {
					return res.status(200).json({
						message: 'Invalid username or password',
					});
				}

				return res.status(200).json({
					message: 'Login successful',
				});
			});
		})
		.catch((err) => {
			console.log(`[ AUTH MICROSERVICE : LOGIN ERROR ]`);
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

	User.findByPk(username)
		.then((user) => {
			if (user) {
				return res.status(200).json({
					message: 'Username taken',
				});
			}

			return bcrypt
				.hash(password, 16)
				.then((hashedPassword) => {
					return User.create({
						username,
						password: hashedPassword,
					});
				})
				.then((newUser) => {
					return newUser.save();
				})
				.then(() => {
					res.status(201).json({
						message: 'New user created successfully',
					});
				});
		})
		.catch((err) => {
			console.log(`[ AUTH MICROSERVICE : LOGIN ERROR ]`);
			next(err);
		});
};
