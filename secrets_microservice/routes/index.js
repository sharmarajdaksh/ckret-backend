const express = require('express');

const router = express.Router();

const controller = require('../controllers');

router.get('/:username', controller.getSecrets);
router.post('/:username', controller.addSecret);
router.delete('/:username/:secretId', controller.deleteSecret);
router.put('/:username/:secretId', controller.updateSecret);

module.exports = router;