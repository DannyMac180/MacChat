const express = require('express');
const router = express.Router();
const { CacheKeys } = require('librechat-data-provider');
const { updateUserKey, deleteUserKey, getUserKeyExpiry } = require('../services/UserService');
const { getLogStores } = require('~/cache');
const { requireJwtAuth } = require('../middleware/');

router.put('/', requireJwtAuth, async (req, res) => {
  await updateUserKey({ userId: req.user.id, ...req.body });
  
  // Invalidate models cache when user updates API key
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  await cache.delete(CacheKeys.MODELS_CONFIG);
  
  res.status(201).send();
});

router.delete('/:name', requireJwtAuth, async (req, res) => {
  const { name } = req.params;
  await deleteUserKey({ userId: req.user.id, name });
  
  // Invalidate models cache when user deletes API key
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  await cache.delete(CacheKeys.MODELS_CONFIG);
  
  res.status(204).send();
});

router.delete('/', requireJwtAuth, async (req, res) => {
  const { all } = req.query;

  if (all !== 'true') {
    return res.status(400).send({ error: 'Specify either all=true to delete.' });
  }

  await deleteUserKey({ userId: req.user.id, all: true });
  
  // Invalidate models cache when user deletes all API keys
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  await cache.delete(CacheKeys.MODELS_CONFIG);

  res.status(204).send();
});

router.get('/', requireJwtAuth, async (req, res) => {
  const { name } = req.query;
  const response = await getUserKeyExpiry({ userId: req.user.id, name });
  res.status(200).send(response);
});

module.exports = router;
