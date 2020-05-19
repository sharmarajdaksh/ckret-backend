require('dotenv').config();

const express = require('express');
const morgan = require('morgan')('common');
const bodyParser = require('body-parser');

const sequelize = require('./db');
const router = require('./routes');

const PORT = process.env.PORT || 3002;

const eraseDatabaseOnSync = false;

const app = express();

app.use(morgan);
app.use((req, res, next) => {
	res.set({ 'Content-Type': 'application/json' });
	next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(router);

app.use((error, req, res, next) => {
	res.status(500).json({
		message: 'An error occurred',
		error,
	});
});

sequelize
	.sync({ force: eraseDatabaseOnSync })
	.then(() => {
		app.listen(PORT, () =>
			console.log(`[ SECRETS MICROSERVICE : LISTENING ON PORT ${PORT} ]`)
		);
	})
	.catch(() => {
		console.log(`[  SECRETS MICROSERVICE : FAILED TO START ]`);
    });
