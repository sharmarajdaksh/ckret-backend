const express = require('express');

const controller = require('../controllers');
const validateToken = require('../middleware/validateToken');

const router = express.Router();

router.post('/signup', controller.signup);
router.post('/login', controller.login);

router.get('/secrets/:username', validateToken, controller.getSecrets);
router.post('/secrets/:username', validateToken, controller.addSecret);
router.put('/secrets/:username/:secretId', validateToken, controller.updateSecret);
router.delete('/secrets/:username/:secretId', validateToken, controller.deleteSecret);

module.exports = router;
