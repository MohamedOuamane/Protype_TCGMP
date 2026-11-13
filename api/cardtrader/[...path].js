const API_ORIGIN = 'https://api.cardtrader.com';
const API_PREFIX = '/api/v2/';

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Only read-only GET requests are supported.' });
  }

  const token = process.env.CARDTRADER_TOKEN;
  if (!token) {
    return response.status(503).json({ error: 'CardTrader integration is not configured for this demo.' });
  }

  let upstream;
  try {
    if (request.query.path === 'request') {
      upstream = new URL(request.query.url);
    } else {
      const suffix = Array.isArray(request.query.path)
        ? request.query.path.join('/')
        : request.query.path || 'info';
      upstream = new URL(`${API_ORIGIN}${API_PREFIX}${suffix}`);
      for (const [key, value] of Object.entries(request.query)) {
        if (key !== 'path' && typeof value === 'string') upstream.searchParams.set(key, value);
      }
    }
    if (upstream.origin !== API_ORIGIN || !upstream.pathname.startsWith(API_PREFIX)) throw new Error('Invalid URL');
  } catch {
    return response.status(400).json({ error: 'Only CardTrader API v2 URLs are supported.' });
  }

  try {
    const upstreamResponse = await fetch(upstream, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    response.setHeader('Content-Type', upstreamResponse.headers.get('content-type') || 'application/json');
    response.setHeader('Cache-Control', 'private, max-age=300');
    return response.status(upstreamResponse.status).send(await upstreamResponse.text());
  } catch {
    return response.status(502).json({ error: 'CardTrader could not be reached.' });
  }
};
