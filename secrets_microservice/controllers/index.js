const Cryptr = require('cryptr');

const CRYPTR_SECRET = process.env.CRYPTR_SECRET;
const cryptr = new Cryptr(CRYPTR_SECRET);

const Secret = require('../models/secret');

exports.getSecrets = (req, res, next) => {
	const username = req.params.username;

	Secret.findAll({
		where: {
			username,
		},
	}).then((secrets) => {
		res.status(200).json({
			secrets: secrets.map((secret) => {
				secret.value = cryptr.decrypt(secret.value);
				return secret;
			}),
		});
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

	Secret.create({
		username,
		key,
		value: cryptr.encrypt(value),
	})
		.then((secret) => {
			return secret.save();
		})
		.then((secret) => {
			return res.status(201).json(secret);
		})
		.catch((err) => {
			next(err);
		});
};

exports.deleteSecret = (req, res, next) => {
	const username = req.params.username;
	const secretId = req.params.secretId;

	Secret.findByPk(secretId)
		.then((secret) => {
			if (!secret) {
				return res.status(404).json({ message: 'Secret not found' });
			}

			if (secret.username !== username) {
				return res.status(403).json({ message: 'Unauthorized' });
			}

			return secret.destroy().then(() => {
				return res.status(200).json({ message: 'Secret deleted' });
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.updateSecret = (req, res, next) => {
	const username = req.params.username;
	const secretId = req.params.secretId;

	const { key, value } = req.body;

	if (!key || !value) {
		return res.status(422).json({
			message: 'You must provide a key and value for a secret',
		});
	}

	Secret.findByPk(secretId)
		.then((secret) => {
			if (!secret) {
				return res.status(404).json({ message: 'Secret not found' });
			}

			if (secret.username !== username) {
				return res.status(403).json({ message: 'Unauthorized' });
			}

			return secret
				.update({ key, value: cryptr.encrypt(value) })
				.then(() => {
					return res.status(200).json({ message: 'Secret updated' });
				});
		})
		.catch((err) => {
			next(err);
		});
};
