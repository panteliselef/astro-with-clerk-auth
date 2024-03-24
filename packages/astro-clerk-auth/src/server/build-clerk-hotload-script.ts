import { createDevOrStagingUrlCache, parsePublishableKey } from '@clerk/shared/keys';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from '@clerk/shared/proxy';
import { addClerkPrefix } from '@clerk/shared/url';
import { versionSelector } from '../internal/utils/versionSelector';
import { CLERK_JS_URL, CLERK_JS_VARIANT, CLERK_JS_VERSION, DOMAIN, PROXY_URL, PUBLISHABLE_KEY } from '../v0/constants';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

type BuildClerkJsScriptOptions = {
  proxyUrl: string;
  domain: string;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  publishableKey: string;
};

const clerkJsScriptUrl = (opts: BuildClerkJsScriptOptions) => {
  const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey } = opts;

  if (clerkJSUrl) {
    return clerkJSUrl;
  }

  let scriptHost = '';
  if (!!proxyUrl && isValidProxyUrl(proxyUrl)) {
    scriptHost = proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, '');
  } else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || '')) {
    scriptHost = addClerkPrefix(domain);
  } else {
    scriptHost = parsePublishableKey(publishableKey)?.frontendApi || '';
  }

  const variant = clerkJSVariant ? `${clerkJSVariant.replace(/\.+$/, '')}.` : '';
  const version = versionSelector(clerkJSVersion);
  return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
};

function buildClerkHotloadScript() {
  const scriptSrc = clerkJsScriptUrl({
    clerkJSUrl: CLERK_JS_URL,
    clerkJSVariant: CLERK_JS_VARIANT,
    clerkJSVersion: CLERK_JS_VERSION,
    domain: DOMAIN,
    proxyUrl: PROXY_URL,
    publishableKey: PUBLISHABLE_KEY,
  });
  return `
  <script src="${scriptSrc}" 
  data-clerk-script 
  async 
  crossOrigin='anonymous' 
  data-clerk-publishable-key="${PUBLISHABLE_KEY}"
  data-clerk-proxy-url="${PROXY_URL}"
  data-clerk-domain="${DOMAIN}"
  ></script>\n`;
}

export { buildClerkHotloadScript };
