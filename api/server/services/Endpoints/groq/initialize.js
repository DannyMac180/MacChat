const { ErrorTypes, EModelEndpoint } = require('librechat-data-provider');
const {
  isEnabled,
  resolveHeaders,
  isUserProvided,
  getOpenAIConfig,
  createHandleLLMNewToken,
} = require('@librechat/api');
const { getUserKeyValues, checkUserKeyExpiry } = require('~/server/services/UserService');
const OpenAIClient = require('~/app/clients/OpenAIClient');

const initializeClient = async ({
  req,
  res,
  endpointOption,
  optionsOnly,
  overrideEndpoint,
  overrideModel,
}) => {
  const {
    PROXY,
    GROQ_API_KEY,
    GROQ_REVERSE_PROXY,
    DEBUG_GROQ,
  } = process.env;
  const { key: expiresAt } = req.body;
  const modelName = overrideModel ?? req.body.model;
  const endpoint = overrideEndpoint ?? req.body.endpoint ?? EModelEndpoint.groq;

  const userProvidesKey = isUserProvided(GROQ_API_KEY);
  const userProvidesURL = isUserProvided(GROQ_REVERSE_PROXY);

  let userValues = null;
  if (expiresAt && (userProvidesKey || userProvidesURL)) {
    checkUserKeyExpiry(expiresAt, endpoint);
    userValues = await getUserKeyValues({ userId: req.user.id, name: endpoint });
  }

  let apiKey = userProvidesKey ? userValues?.apiKey : GROQ_API_KEY;
  let baseURL = userProvidesURL ? userValues?.baseURL : GROQ_REVERSE_PROXY;

  let clientOptions = {
    proxy: PROXY ?? null,
    debug: isEnabled(DEBUG_GROQ),
    reverseProxyUrl: baseURL ?? 'https://api.groq.com/openai/v1',
    streamRate: 17, // Default stream rate for Groq
    ...endpointOption,
  };

  /** @type {undefined | TBaseEndpoint} */
  const groqConfig = req.app.locals[EModelEndpoint.groq];

  if (groqConfig) {
    clientOptions.streamRate = groqConfig.streamRate ?? clientOptions.streamRate;
    clientOptions.titleModel = groqConfig.titleModel;
  }

  /** @type {undefined | TBaseEndpoint} */
  const allConfig = req.app.locals.all;
  if (allConfig) {
    clientOptions.streamRate = allConfig.streamRate ?? clientOptions.streamRate;
  }

  if (userProvidesKey && !apiKey) {
    throw new Error(
      JSON.stringify({
        type: ErrorTypes.NO_USER_KEY,
      }),
    );
  }

  if (!apiKey) {
    throw new Error(`${endpoint} API Key not provided.`);
  }

  if (optionsOnly) {
    const modelOptions = endpointOption?.model_parameters ?? {};
    modelOptions.model = modelName;
    clientOptions = Object.assign({ modelOptions }, clientOptions);
    clientOptions.modelOptions.user = req.user.id;
    const options = getOpenAIConfig(apiKey, clientOptions, EModelEndpoint.groq);
    const streamRate = clientOptions.streamRate;
    if (!streamRate) {
      return options;
    }
    options.llmConfig.callbacks = [
      {
        handleLLMNewToken: createHandleLLMNewToken(streamRate),
      },
    ];
    return options;
  }

  const client = new OpenAIClient(apiKey, Object.assign({ req, res }, clientOptions));
  return {
    client,
    openAIApiKey: apiKey,
  };
};

module.exports = initializeClient;
