const express = require('express');
const router = express.Router();
const { CacheKeys, EModelEndpoint } = require('librechat-data-provider');
const { updateUserKey, deleteUserKey, getUserKeyExpiry } = require('../services/UserService');
const { getLogStores } = require('~/cache');
const { requireJwtAuth } = require('../middleware/');

/**
 * Invalidates cache for user-provided API keys
 * @param {string} userId - The user ID
 * @param {string} name - The endpoint name
 */
const invalidateUserKeyCache = async (userId, name) => {
  // Always invalidate the main models config cache
  const configCache = getLogStores(CacheKeys.CONFIG_STORE);
  await configCache.delete(CacheKeys.MODELS_CONFIG);
  
  // For Groq, also invalidate the user-specific model queries cache
  if (name === EModelEndpoint.groq) {
    const modelQueriesCache = getLogStores(CacheKeys.MODEL_QUERIES);
    const groqBaseURL = 'https://api.groq.com/openai/v1';
    const userSpecificCacheKey = `${groqBaseURL}:${userId}`;
    await modelQueriesCache.delete(userSpecificCacheKey);
  }
};

router.put('/', requireJwtAuth, async (req, res) => {
  await updateUserKey({ userId: req.user.id, ...req.body });
  
  // Invalidate cache when user updates API key
  await invalidateUserKeyCache(req.user.id, req.body.name);
  
  res.status(201).send();
});

router.delete('/:name', requireJwtAuth, async (req, res) => {
  const { name } = req.params;
  await deleteUserKey({ userId: req.user.id, name });
  
  // Invalidate cache when user deletes API key
  await invalidateUserKeyCache(req.user.id, name);
  
  res.status(204).send();
});

router.delete('/', requireJwtAuth, async (req, res) => {
  const { all } = req.query;

  if (all !== 'true') {
    return res.status(400).send({ error: 'Specify either all=true to delete.' });
  }

  await deleteUserKey({ userId: req.user.id, all: true });
  
  // Invalidate cache when user deletes all API keys
  const configCache = getLogStores(CacheKeys.CONFIG_STORE);
  await configCache.delete(CacheKeys.MODELS_CONFIG);
  
  // Also invalidate Groq-specific cache
  const modelQueriesCache = getLogStores(CacheKeys.MODEL_QUERIES);
  const groqBaseURL = 'https://api.groq.com/openai/v1';
  const userSpecificCacheKey = `${groqBaseURL}:${req.user.id}`;
  await modelQueriesCache.delete(userSpecificCacheKey);

  res.status(204).send();
});

router.get('/', requireJwtAuth, async (req, res) => {
  const { name } = req.query;
  const response = await getUserKeyExpiry({ userId: req.user.id, name });
  res.status(200).send(response);
});

module.exports = router;
