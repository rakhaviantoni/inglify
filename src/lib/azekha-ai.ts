export function createAzekhaAIConfig(app: string, fallbackBaseURL = 'https://ai.sumopod.com/v1', fallbackApiKey = '') {
  const gatewayUrl = import.meta.env.AZEKHA_AI_GATEWAY_URL?.replace(/\/$/, '');

  if (!gatewayUrl) {
    return {
      apiKey: fallbackApiKey,
      baseURL: fallbackBaseURL,
      defaultHeaders: undefined,
    };
  }

  return {
    apiKey: import.meta.env.AZEKHA_AI_GATEWAY_API_KEY || import.meta.env.AZEKHA_AI_GATEWAY_TOKEN || fallbackApiKey || 'azekha-public',
    baseURL: `${gatewayUrl}/public/v1`,
    defaultHeaders: {
      'x-azekha-app': app,
    },
  };
}
