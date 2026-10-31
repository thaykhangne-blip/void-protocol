/* Authenticated inline story-text editor. Set window.VOID_TEXT_EDITOR_API to the deployed Worker URL. */
(() => {
  'use strict';
  const API = String(window.VOID_TEXT_EDITOR_API || '').replace(/\/$/, '');
  let sessionToken = sessionStorage.getItem('voidDevEditorSession') || '';
  const consumeToken = () => { const params = new URLSearchParams(location.search); const token = params.get('dev-token'); if (token) { sessionToken = token; sessionStorage.setItem('voidDevEditorSession', token); params.delete('dev-token'); params.delete('dev-auth'); const query = params.toString(); history.replaceState({}, '', location.pathname + (query ? '?' + query : '') + location.hash); } };
  consumeToken();
  let authenticated = false, enabled = false, panel, statusNode, loginButton, selected = null;
  const request = async (path, options = {}) => {
    if (!API) throw new Error('Developer API is not configured. See docs/dev-text-editor.md.');
    const response = await fetch(API + path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(sessionToken ? { Authorization: 'Bearer ' + sessionToken } : {}), ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || ('Request failed (' + response.status + ')'));
    return data;
  };
  function status(message, error = false) { if (statusNode) { statusNode.textContent = message; statusNode.style.color = error ? '#ff8eaa' : '#91f5d7'; } }
  function ensurePanel() {
    if (panel) return;
    const style = document.createElement('style');
    style.textContent = `
      #voidDevTextPanel{position:fixed;z-index:2147483000;right:16px;top:16px;width:min(390px,calc(100vw - 32px));padding:16px;background:#080d1bf5;border:1px solid #6963b9;border-radius:8px;color:#e9f3ff;font:13px system-ui;box-shadow:0 18px 60px #000b}
      #voidDevTextPanel[hidden]{display:none}#voidDevTextPanel h2{font-size:14px;letter-spacing:2px;margin:0 0 10px;color:#c7c1ff}
      #voidDevTextPanel p{font-size:12px;line-height:1.5;color:#aab8d3}#voidDevTextPanel button{background:#171e35;border:1px solid #444f78;color:#eef4ff;border-radius:4px;padding:8px 10px;cursor:pointer;font:inherit}
      #voidDevTextPanel button:disabled{opacity:.5;cursor:wait}#voidDevTextPanel textarea{display:block;width:100%;min-height:130px;resize:vertical;background:#050914;color:#f4f7ff;border:1px solid #424d70;border-radius:4px;padding:10px;font:13px/1.5 ui-monospace,monospace;box-sizing:border-box}
      #voidDevTextPanel .void-dev-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#voidDevTextStatus{min-height:18px;margin-top:8px;font-size:11px}
      .void-dev-edit{display:inline-flex;vertical-align:middle;margin:0 0 0 8px;padding:3px 6px;border:1px solid #8178d8;border-radius:4px;background:#0b1224;color:#d9d4ff;font:700 10px system-ui;cursor:pointer}
      body.void-dev-enabled [data-void-editable="true"]{outline:1px dashed #81778d88;outline-offset:3px}
    `;
    document.head.append(style);
    panel = document.createElement('section'); panel.id = 'voidDevTextPanel'; panel.hidden = true;
    panel.innerHTML = `<h2>VOID PROTOCOL · DEV TOOLS</h2><p id="voidDevTextIntro">Sign in with the authorized GitHub account to edit campaign dialogue.</p><div id="voidDevTextEditor" hidden><label for="voidDevTextValue">Selected text</label><textarea id="voidDevTextValue" maxlength="8000" spellcheck="true"></textarea><div class="void-dev-row"><button id="voidDevTextApply" type="button">APPLY PREVIEW</button><button id="voidDevTextSave" type="button">SAVE TO GITHUB</button><button id="voidDevTextCancel" type="button">CANCEL</button></div></div><div class="void-dev-row"><button id="voidDevTextLogin" type="button">SIGN IN WITH GITHUB</button><button id="voidDevTextLogout" type="button" hidden>SIGN OUT</button><button id="voidDevTextClose" type="button">CLOSE</button></div><div id="voidDevTextStatus" role="status"></div>`;
    document.body.append(panel); statusNode = panel.querySelector('#voidDevTextStatus'); loginButton = panel.querySelector('#voidDevTextLogin');
    loginButton.addEventListener('click', async () => { try { window.location.assign(API + '/auth/login'); } catch (e) { status(e.message, true); } });
    panel.querySelector('#voidDevTextLogout').addEventListener('click', async () => { try { await request('/auth/logout', { method: 'POST', body: '{}' }); sessionToken = ''; sessionStorage.removeItem('voidDevEditorSession'); authenticated = false; enabled = false; document.body.classList.remove('void-dev-enabled'); refreshAuthUI(); status('Signed out.'); } catch (e) { status(e.message, true); } });
    panel.querySelector('#voidDevTextClose').addEventListener('click', () => { panel.hidden = true; });
    panel.querySelector('#voidDevTextCancel').addEventListener('click', () => { panel.querySelector('#voidDevTextEditor').hidden = true; status('Edit cancelled.'); });
  }
  function openEditor(item) {
    selected = item; ensurePanel(); panel.hidden = false;
    panel.querySelector('#voidDevTextIntro').textContent = 'Editing ' + item.sceneId + ' · line ' + (item.lineIndex + 1) + '.';
    panel.querySelector('#voidDevTextEditor').hidden = false; panel.querySelector('#voidDevTextValue').value = item.text;
    status('Preview first, then save to the repository.');
    panel.querySelector('#voidDevTextApply').onclick = () => { item.text = panel.querySelector('#voidDevTextValue').value; item.element.textContent = item.text; status('Preview applied. Not yet saved.'); };
    panel.querySelector('#voidDevTextSave').onclick = async event => {
      const button = event.currentTarget, text = panel.querySelector('#voidDevTextValue').value;
      if (!text.trim() || text.length > 8000) { status('Text must contain 1–8,000 characters.', true); return; }
      if (!window.confirm('Commit this dialogue change to GitHub and trigger deployment?')) return;
      button.disabled = true;
      try { const result = await request('/api/text/save', { method: 'POST', body: JSON.stringify({ sceneId: item.sceneId, lineIndex: item.lineIndex, text }) }); item.text = text; item.element.textContent = text; status('Committed ' + (result.commit || 'successfully') + '. Reload after Pages deployment finishes.'); }
      catch (e) { status(e.message, true); } finally { button.disabled = false; }
    };
  }
  function decorate(item) {
    if (!item || !item.element || !authenticated || !enabled || item.element.dataset.voidEditorDecorated === 'true') return;
    item.element.dataset.voidEditorDecorated = 'true'; item.element.dataset.voidEditable = 'true';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'void-dev-edit'; button.textContent = '✎ EDIT'; button.setAttribute('aria-label', 'Edit dialogue text');
    button.addEventListener('click', event => { event.stopPropagation(); openEditor({ ...item }); });
    item.element.insertAdjacentElement('afterend', button);
  }
  function refreshAuthUI() {
    ensurePanel(); loginButton.hidden = authenticated; panel.querySelector('#voidDevTextLogout').hidden = !authenticated;
    panel.querySelector('#voidDevTextIntro').textContent = authenticated ? 'Authenticated. Press Ctrl+Shift+D to enable or disable Dev Mode.' : 'Only the configured GitHub account can authenticate.';
    document.querySelectorAll('.void-dev-edit').forEach(node => { if (node.previousElementSibling) delete node.previousElementSibling.dataset.voidEditorDecorated; node.remove(); });
  }
  async function checkAuth() {
    ensurePanel();
    try { const result = await request('/auth/me'); authenticated = result.authenticated === true && (!result.username || result.username.toLowerCase() === String(result.authorizedUsername || result.username).toLowerCase()); } catch { authenticated = false; }
    refreshAuthUI();
    if (new URLSearchParams(location.search).get('dev-auth') === 'success') { history.replaceState({}, '', location.pathname + location.hash); panel.hidden = false; status(authenticated ? 'GitHub authentication successful.' : 'Authentication did not authorize this account.', !authenticated); }
  }
  document.addEventListener('keydown', event => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
      event.preventDefault(); ensurePanel();
      if (!panel.hidden && !authenticated) { panel.hidden = true; return; }
      panel.hidden = false;
      if (!authenticated) { status('Sign in with the authorized GitHub account.'); return; }
      enabled = !enabled; document.body.classList.toggle('void-dev-enabled', enabled); refreshAuthUI();
      status(enabled ? 'Dev Mode enabled. Edit controls appear beside story dialogue.' : 'Dev Mode disabled.');
      if (enabled && window.__voidCurrentStoryLine) decorate(window.__voidCurrentStoryLine);
    }
  });
  window.__voidTextEditor = { decorate, isEnabled: () => authenticated && enabled };
  checkAuth();
})();
