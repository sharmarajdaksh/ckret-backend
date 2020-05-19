const Sequelize = require('sequelize');

const sequelize = require('../db');

module.exports = sequelize.define('user', {
	username: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			notEmpty: true,
		},
		primaryKey: true,
	},
	password: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			notEmpty: true,
		},
	},
});
