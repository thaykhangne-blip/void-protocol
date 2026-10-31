const API = 'https://api.github.com';
const COOKIE = 'void_dev_session';
const STATE_COOKIE = 'void_dev_oauth_state';
const SESSION_SECONDS = 28800;
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
function json(data, status = 200, headers = {}) { return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } }); }
function b64url(bytes) { let s = ''; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); }
function decodeB64url(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(s + '='.repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0)); }
function cookie(request, name) { const part = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '=')); return part ? part.slice(name.length + 1) : ''; }
function cookieHeader(name, value, maxAge, sameSite) { return name + '=' + value + '; Path=/; Max-Age=' + maxAge + '; HttpOnly; Secure; SameSite=' + (sameSite || 'None'); }
function cors(request, env) { const origin = request.headers.get('Origin'); return origin && origin === env.ALLOWED_ORIGIN ? { 'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,authorization', 'vary': 'Origin' } : {}; }
async function hmac(secret, value) { const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return b64url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))); }
async function signedSession(env, username) { const payload = b64url(new TextEncoder().encode(JSON.stringify({ username, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS }))); return payload + '.' + await hmac(env.SESSION_SECRET, payload); }
async function readSession(request, env) {
  const authorization = request.headers.get('Authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : cookie(request, COOKIE);
  const parts = token.split('.');
  if (parts.length !== 2 || await hmac(env.SESSION_SECRET, parts[0]) !== parts[1]) return null;
  try { const data = JSON.parse(new TextDecoder().decode(decodeB64url(parts[0]))); if (!data.username || data.exp < Date.now() / 1000 || data.username.toLowerCase() !== env.AUTHORIZED_GITHUB_USER.toLowerCase()) return null; return data; } catch { return null; }
}
async function githubFetch(path, token, options = {}) {
  const response = await fetch(API + path, { ...options, headers: { accept: 'application/vnd.github+json', authorization: 'Bearer ' + token, 'x-github-api-version': '2022-11-28', ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('GitHub API error ' + response.status + ': ' + (data.message || 'request failed'));
  return data;
}
function encodeBase64Utf8(text) { const bytes = new TextEncoder().encode(text); let binary = ''; for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768)); return btoa(binary); }
function pemBytes(pem) { return Uint8Array.from(atob(pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')), c => c.charCodeAt(0)); }
async function appToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ iat: now - 30, exp: now + 480, iss: env.GITHUB_APP_ID })));
  const unsigned = header + '.' + payload;
  const key = await crypto.subtle.importKey('pkcs8', pemBytes(env.GITHUB_APP_PRIVATE_KEY), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const jwt = unsigned + '.' + b64url(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));
  const response = await fetch(API + '/app/installations/' + env.GITHUB_APP_INSTALLATION_ID + '/access_tokens', { method: 'POST', headers: { authorization: 'Bearer ' + jwt, accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'content-type': 'application/json' }, body: JSON.stringify({ permissions: { contents: 'write' } }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('GitHub App token error: ' + (data.message || response.status));
  return data.token;
}
function matchingBrace(text, start, open, close) {
  let depth = 0, quote = '', escaped = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
  }
  return -1;
}
function replaceStoryLine(source, sceneId, lineIndex, newText) {
  if (typeof sceneId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(sceneId)) throw new Error('Invalid scene identifier.');
  if (!Number.isInteger(lineIndex) || lineIndex < 0 || lineIndex > 100) throw new Error('Invalid dialogue line index.');
  const idPattern = new RegExp('"id"\\s*:\\s*"' + sceneId + '"|\\bid\\s*:\\s*"' + sceneId + '"');
  const idMatch = idPattern.exec(source);
  if (!idMatch) throw new Error('Scene not found: ' + sceneId);
  const objectStart = source.lastIndexOf('{', idMatch.index);
  const objectEnd = matchingBrace(source, objectStart, '{', '}');
  if (objectStart < 0 || objectEnd < 0) throw new Error('Could not locate scene object.');
  const scene = source.slice(objectStart, objectEnd + 1);
  const linesMatch = /\blines\s*:\s*\[/.exec(scene);
  if (!linesMatch) throw new Error('Scene has no editable dialogue lines.');
  const linesStart = objectStart + linesMatch.index + linesMatch[0].lastIndexOf('[');
  const linesEnd = matchingBrace(source, linesStart, '[', ']');
  if (linesEnd < 0 || linesEnd > objectEnd) throw new Error('Could not locate dialogue list.');
  let cursor = linesStart + 1, currentIndex = -1, targetStart = -1, targetEnd = -1;
  while (cursor < linesEnd) {
    const open = source.indexOf('{', cursor);
    if (open < 0 || open >= linesEnd) break;
    const close = matchingBrace(source, open, '{', '}');
    if (close < 0 || close > linesEnd) break;
    currentIndex++;
    if (currentIndex === lineIndex) { targetStart = open; targetEnd = close + 1; break; }
    cursor = close + 1;
  }
  if (targetStart < 0) throw new Error('Dialogue line index not found.');
  const line = source.slice(targetStart, targetEnd);
  const match = /(["']text["']\s*:\s*)(["'])/.exec(line);
  if (!match) throw new Error('Dialogue line has no text property.');
  const valueStart = match.index + match[0].length - 1, quote = line[valueStart];
  let end = valueStart + 1, escaped = false;
  for (; end < line.length; end++) { const c = line[end]; if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) break; }
  if (end >= line.length) throw new Error('Could not parse current dialogue text.');
  const updatedLine = line.slice(0, valueStart) + JSON.stringify(newText) + line.slice(end + 1);
  return source.slice(0, targetStart) + updatedLine + source.slice(targetEnd);
}
function checkConfig(env) {
  const keys = ['ALLOWED_ORIGIN','AUTHORIZED_GITHUB_USER','GITHUB_OAUTH_CLIENT_ID','GITHUB_OAUTH_CLIENT_SECRET','GITHUB_OAUTH_CALLBACK_URL','GITHUB_APP_ID','GITHUB_APP_INSTALLATION_ID','GITHUB_APP_PRIVATE_KEY','SESSION_SECRET','REPO_OWNER','REPO_NAME','FRONTEND_URL'];
  const missing = keys.filter(k => !env[k]);
  if (missing.length) throw new Error('Worker configuration missing: ' + missing.join(', '));
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url), headers = cors(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    try {
      checkConfig(env);
      if ((url.pathname === '/auth/login' || url.pathname === '/auth/login-url') && request.method === 'GET') {
        const state = crypto.randomUUID(), auth = new URL('https://github.com/login/oauth/authorize');
        auth.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID); auth.searchParams.set('redirect_uri', env.GITHUB_OAUTH_CALLBACK_URL); auth.searchParams.set('scope', 'read:user'); auth.searchParams.set('state', state);
        if (url.pathname === '/auth/login-url') return json({ url: auth.toString() }, 200, { ...headers, 'set-cookie': cookieHeader(STATE_COOKIE, state, 600, 'Lax') });
        return new Response('', { status: 302, headers: { location: auth.toString(), 'set-cookie': cookieHeader(STATE_COOKIE, state, 600, 'Lax'), 'cache-control': 'no-store' } });
      }
      if (url.pathname === '/auth/callback' && request.method === 'GET') {
        const state = cookie(request, STATE_COOKIE);
        if (!state || state !== url.searchParams.get('state')) return new Response('OAuth state validation failed. Return to the game and try again.', { status: 400 });
        const code = url.searchParams.get('code');
        if (!code) return new Response('GitHub did not return an authorization code.', { status: 400 });
        const exchange = await fetch('https://github.com/login/oauth/access_token', { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/json' }, body: JSON.stringify({ client_id: env.GITHUB_OAUTH_CLIENT_ID, client_secret: env.GITHUB_OAUTH_CLIENT_SECRET, code, redirect_uri: env.GITHUB_OAUTH_CALLBACK_URL }) });
        const tokenData = await exchange.json();
        if (!exchange.ok || !tokenData.access_token) return new Response('GitHub sign-in failed.', { status: 401 });
        const profileResponse = await fetch('https://api.github.com/user', { headers: { authorization: 'Bearer ' + tokenData.access_token, accept: 'application/vnd.github+json', 'user-agent': 'Void-Protocol-Dev-Editor' } });
        const profile = await profileResponse.json();
        if (!profileResponse.ok || !profile.login || profile.login.toLowerCase() !== env.AUTHORIZED_GITHUB_USER.toLowerCase()) return new Response('This GitHub account is not authorized to use the developer editor.', { status: 403 });
        const session = await signedSession(env, profile.login);
        return new Response('', { status: 302, headers: { location: (env.FRONTEND_URL || env.ALLOWED_ORIGIN + '/') + (String(env.FRONTEND_URL || '').includes('?') ? '&' : '?') + 'dev-auth=success&dev-token=' + encodeURIComponent(session), 'set-cookie': cookieHeader(STATE_COOKIE, '', 0, 'Lax'), 'cache-control': 'no-store' } });
      }
      if (url.pathname === '/auth/me' && request.method === 'GET') {
        const session = await readSession(request, env);
        return json({ authenticated: !!session, username: session ? session.username : null, authorizedUsername: env.AUTHORIZED_GITHUB_USER }, 200, headers);
      }
      if (url.pathname === '/auth/logout' && request.method === 'POST') return json({ ok: true }, 200, { ...headers, 'set-cookie': cookieHeader(COOKIE, '', 0) });
      if (url.pathname === '/api/text/save' && request.method === 'POST') {
        const session = await readSession(request, env);
        if (!session) return json({ error: 'Authentication required.' }, 401, headers);
        if (request.headers.get('Origin') !== env.ALLOWED_ORIGIN) return json({ error: 'Origin not allowed.' }, 403, headers);
        const input = await request.json();
        if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 8000) return json({ error: 'Text must contain 1–8,000 characters.' }, 400, headers);
        const token = await appToken(env);
        const path = '/repos/' + encodeURIComponent(env.REPO_OWNER) + '/' + encodeURIComponent(env.REPO_NAME) + '/contents/src/data/story.js';
        const current = await githubFetch(path, token);
        const source = new TextDecoder().decode(Uint8Array.from(atob(current.content.replace(/\s/g, '')), c => c.charCodeAt(0)));
        const updated = replaceStoryLine(source, input.sceneId, input.lineIndex, input.text);
        if (updated === source) return json({ error: 'No change detected.' }, 400, headers);
        const commit = await githubFetch(path, token, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Edit story dialogue: ' + input.sceneId, content: encodeBase64Utf8(updated), sha: current.sha, branch: env.GITHUB_BRANCH || 'main' }) });
        return json({ ok: true, commit: commit.commit ? commit.commit.sha : null, sceneId: input.sceneId, lineIndex: input.lineIndex }, 200, headers);
      }
      return json({ error: 'Not found.' }, 404, headers);
    } catch (error) { return json({ error: error && error.message ? error.message : 'Unexpected Worker error.' }, 500, headers); }
  }
};
