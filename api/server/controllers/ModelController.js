const { CacheKeys, extractEnvVariable } = require('librechat-data-provider');
const { loadDefaultModels, loadConfigModels } = require('~/server/services/Config');
const { getCustomEndpointConfig } = require('~/server/services/Config');
const { getUserKeyValues } = require('~/server/services/UserService');
const { fetchModels } = require('~/server/services/ModelService');
const { isUserProvided } = require('~/server/utils');
const { getLogStores } = require('~/cache');
const { logger } = require('~/config');

/**
 * @param {ServerRequest} req
 */
const getModelsConfig = async (req) => {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  let modelsConfig = await cache.get(CacheKeys.MODELS_CONFIG);
  if (!modelsConfig) {
    modelsConfig = await loadModels(req);
  }

  return modelsConfig;
};

/**
 * Loads the models from the config.
 * @param {ServerRequest} req - The Express request object.
 * @returns {Promise<TModelsConfig>} The models config.
 */
async function loadModels(req) {
  const cache = getLogStores(CacheKeys.CONFIG_STORE);
  const cachedModelsConfig = await cache.get(CacheKeys.MODELS_CONFIG);
  console.log('[DEBUG] loadModels called, cached config exists:', !!cachedModelsConfig);
  if (cachedModelsConfig) {
    console.log('[DEBUG] Returning cached models config');
    return cachedModelsConfig;
  }
  console.log('[DEBUG] No cached config, loading fresh models for user:', req.user?.id);
  const defaultModelsConfig = await loadDefaultModels(req);
  const customModelsConfig = await loadConfigModels(req);

  const modelConfig = { ...defaultModelsConfig, ...customModelsConfig };

  await cache.set(CacheKeys.MODELS_CONFIG, modelConfig);
  return modelConfig;
}

async function modelController(req, res) {
  try {
    const modelConfig = await loadModels(req);
    res.send(modelConfig);
  } catch (error) {
    logger.error('Error fetching models:', error);
    res.status(500).send({ error: error.message });
  }
}

/**
 * Fetches models dynamically for a specific endpoint with user-provided API key
 * @param {ServerRequest} req - The Express request object.
 * @param {Express.Response} res - The Express response object.
 */
async function fetchEndpointModels(req, res) {
  try {
    const { endpoint } = req.params;
    
    const endpointConfig = await getCustomEndpointConfig(endpoint);
    if (!endpointConfig) {
      return res.status(404).json({ error: `Config not found for the ${endpoint} custom endpoint.` });
    }

    const CUSTOM_API_KEY = extractEnvVariable(endpointConfig.apiKey);
    const CUSTOM_BASE_URL = extractEnvVariable(endpointConfig.baseURL);

    const userProvidesKey = isUserProvided(CUSTOM_API_KEY);
    const userProvidesURL = isUserProvided(CUSTOM_BASE_URL);

    let userValues = null;
    if (userProvidesKey || userProvidesURL) {
      try {
        userValues = await getUserKeyValues({ userId: req.user.id, name: endpoint });
      } catch (error) {
        return res.status(401).json({ error: 'User API key not found' });
      }
    }

    const apiKey = userProvidesKey ? userValues?.apiKey : CUSTOM_API_KEY;
    const baseURL = userProvidesURL ? userValues?.baseURL : CUSTOM_BASE_URL;

    if (!apiKey) {
      return res.status(401).json({ error: `${endpoint} API key not provided.` });
    }

    if (!baseURL) {
      return res.status(400).json({ error: `${endpoint} Base URL not provided.` });
    }

    const models = await fetchModels({
      user: req.user.id,
      baseURL,
      apiKey,
      name: endpoint,
      userIdQuery: endpointConfig.models.userIdQuery,
    });

    res.json({ models });
  } catch (error) {
    logger.error('Error fetching endpoint models:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { modelController, loadModels, getModelsConfig, fetchEndpointModels };
