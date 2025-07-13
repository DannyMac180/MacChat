const express = require('express');
const { modelController, fetchEndpointModels } = require('~/server/controllers/ModelController');
const { requireJwtAuth } = require('~/server/middleware/');

const router = express.Router();
router.get('/', requireJwtAuth, modelController);
router.get('/endpoint/:endpoint', requireJwtAuth, fetchEndpointModels);

module.exports = router;
