import { createDevOrStagingUrlCache, parsePublishableKey } from '@clerk/shared/keys';
import { isValidProxyUrl, proxyUrlToAbsoluteURL } from '@clerk/shared/proxy';
import { addClerkPrefix } from '@clerk/shared/url';

import { versionSelector } from './versionSelector';

const { isDevOrStagingUrl } = createDevOrStagingUrlCache();

const FAILED_TO_FIND_CLERK_SCRIPT = 'Clerk: Failed find clerk-js script';

type BuildClerkJsScriptOptions = {
  proxyUrl: string;
  domain: string;
  clerkJSUrl?: string;
  clerkJSVariant?: 'headless' | '';
  clerkJSVersion?: string;
  publishableKey: string;
};

export const waitForClerkScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.querySelector('script[data-clerk-script]');

    if (!script) {
      return reject(FAILED_TO_FIND_CLERK_SCRIPT);
    }

    script.addEventListener('load', () => {
      script.remove();
      resolve(script);
    });
  });
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

const applyClerkJsScriptAttributes = (options: BuildClerkJsScriptOptions) => (script: HTMLScriptElement) => {
  const { publishableKey, proxyUrl, domain } = options;
  if (publishableKey) {
    script.setAttribute('data-clerk-publishable-key', publishableKey);
  }

  if (proxyUrl) {
    script.setAttribute('data-clerk-proxy-url', proxyUrl);
  }

  if (domain) {
    script.setAttribute('data-clerk-domain', domain);
  }
};
