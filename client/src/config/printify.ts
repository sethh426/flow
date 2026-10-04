/** Credentials belong to the server. Legacy browser integrations are disabled. */
export const PRINTIFY_CONFIG = {
  shopId: '',
  apiToken: '',
  baseUrl: 'https://api.printify.com/v1',
};
export function isPrintifyConfigured(): boolean { return false; }
export function getPrintifySetupMessage(): string {
  return 'Printify requires a secure server-side connection. Browser API tokens are not supported.';
}
