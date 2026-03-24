export interface CrawlerError {
  userMessage: string;
  technicalMessage: string;
  suggestion: string;
  category: 'bot-protection' | 'network' | 'ssl' | 'server' | 'auth' | 'timeout' | 'unknown';
}

export function getCrawlerErrorMessage(error: any): CrawlerError {
  const errorMessage = error?.message || String(error);

  if (errorMessage.includes('ERR_HTTP2_PROTOCOL_ERROR')) {
    return { userMessage: 'This site has advanced bot protection that blocks automated analysis.', technicalMessage: 'HTTP/2 protocol error - likely Cloudflare, Akamai, or similar protection', suggestion: 'Try analyzing a page you own or a smaller site without enterprise-level protection.', category: 'bot-protection' };
  }
  if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || errorMessage.includes('ENOTFOUND')) {
    return { userMessage: 'Unable to reach this website. The domain may not exist or DNS is not configured.', technicalMessage: 'DNS resolution failed', suggestion: 'Check the URL is correct and the domain is registered.', category: 'network' };
  }
  if (errorMessage.includes('ERR_CONNECTION_REFUSED') || errorMessage.includes('ECONNREFUSED')) {
    return { userMessage: 'The website refused the connection. The server may be down or blocking requests.', technicalMessage: 'Connection refused by server', suggestion: 'Verify the site is online and accessible in a regular browser.', category: 'network' };
  }
  if (errorMessage.includes('ERR_SSL_PROTOCOL_ERROR') || errorMessage.includes('ERR_CERT_AUTHORITY_INVALID') || errorMessage.includes('ERR_CERT_COMMON_NAME_INVALID') || errorMessage.includes('CERT_HAS_EXPIRED')) {
    return { userMessage: "This site has SSL certificate problems. We can't securely connect to analyze it.", technicalMessage: 'SSL/TLS certificate validation failed', suggestion: "Check the site's SSL certificate is valid and not expired.", category: 'ssl' };
  }
  if (errorMessage.includes('ERR_TOO_MANY_REDIRECTS')) {
    return { userMessage: 'This site has a redirect loop and keeps redirecting endlessly.', technicalMessage: 'Too many redirects detected', suggestion: 'Check your redirect configuration - you may have a circular redirect.', category: 'server' };
  }
  if (errorMessage.includes('ERR_TIMED_OUT') || errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
    return { userMessage: 'This site took too long to respond. It may be experiencing performance issues.', technicalMessage: 'Request timeout exceeded', suggestion: 'Try again later or check if the site is slow to load in a regular browser.', category: 'timeout' };
  }
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return { userMessage: 'This site explicitly blocks automated tools and crawlers.', technicalMessage: 'HTTP 403 Forbidden', suggestion: 'You\'ll need to analyze it manually or whitelist our crawler in your robots.txt.', category: 'bot-protection' };
  }
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return { userMessage: 'This page requires login credentials to access.', technicalMessage: 'HTTP 401 Unauthorized', suggestion: 'We can only analyze publicly accessible pages. Try the homepage instead.', category: 'auth' };
  }
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    return { userMessage: "This page doesn't exist on the website.", technicalMessage: 'HTTP 404 Not Found', suggestion: 'Check the URL is correct or try the homepage.', category: 'server' };
  }
  if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
    return { userMessage: "We've made too many requests to this site recently.", technicalMessage: 'HTTP 429 Rate Limited', suggestion: 'Wait a few minutes and try again.', category: 'bot-protection' };
  }
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return { userMessage: 'This site is experiencing server problems.', technicalMessage: 'HTTP 500 Internal Server Error', suggestion: 'Try again later - this is a problem with their server, not our tool.', category: 'server' };
  }
  if (errorMessage.includes('502') || errorMessage.includes('Bad Gateway')) {
    return { userMessage: "The website's server is having gateway issues.", technicalMessage: 'HTTP 502 Bad Gateway', suggestion: 'Try again later - their server infrastructure is having problems.', category: 'server' };
  }
  if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    return { userMessage: 'This website is temporarily unavailable or under maintenance.', technicalMessage: 'HTTP 503 Service Unavailable', suggestion: 'Try again later when the site is back online.', category: 'server' };
  }
  if (errorMessage.includes('Cloudflare') || errorMessage.includes('cf-ray')) {
    return { userMessage: 'This site is protected by Cloudflare and is blocking our crawler.', technicalMessage: 'Cloudflare bot protection triggered', suggestion: 'Large sites with Cloudflare often block automated tools. Try a smaller site.', category: 'bot-protection' };
  }

  return { userMessage: 'Unable to analyze this website due to an unexpected error.', technicalMessage: errorMessage, suggestion: 'Try a different URL or contact support if this persists.', category: 'unknown' };
}
