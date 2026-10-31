# Void Protocol developer text editor

The editor adds authenticated inline editing for campaign dialogue. It is limited to text values in src/data/story.js; it cannot modify gameplay code or arbitrary repository files.

## Security model

- The browser contains no GitHub write token or private key.
- GitHub OAuth sign-in verifies the configured AUTHORIZED_GITHUB_USER.
- A Cloudflare Worker validates an HttpOnly signed session.
- The Worker uses a GitHub App installation token with Contents: read/write permission on this repository only.
- Save requests contain a scene ID, line index, and text. The Worker validates the identifiers and updates only the selected dialogue text.
- Saves commit to the configured branch and trigger deployment if GitHub Pages is configured to deploy that branch.

The shortcut is Ctrl+Shift+D. The shortcut only opens the panel; authentication is the security boundary.

## Required one-time setup

This feature is not live until you deploy and configure the Worker. Never paste secrets into game files or commit them.

1. Create a GitHub OAuth App. Set its authorization callback URL to https://YOUR-WORKER.workers.dev/auth/callback. The OAuth app identifies the signed-in GitHub user and does not need repository write scopes.
2. Create a GitHub App and install it only on thaykhangne-blip/void-protocol. Grant repository permission Contents: Read and write. Generate a private key and record the App ID and installation ID.
3. Install Wrangler and deploy the Worker:
   ```sh
   npm install --global wrangler
   cd worker
   wrangler deploy
   ```
4. Configure these Worker variables in Cloudflare:
   - FRONTEND_URL: the full published game URL, including /void-protocol/ if using a project site, and ending with a slash.
   - AUTHORIZED_GITHUB_USER: your exact GitHub username.
   - GITHUB_OAUTH_CLIENT_ID
   - GITHUB_OAUTH_CALLBACK_URL: the exact Worker callback URL.
   - GITHUB_APP_ID
   - GITHUB_APP_INSTALLATION_ID
   - REPO_OWNER=thaykhangne-blip
   - REPO_NAME=void-protocol
   - GITHUB_BRANCH=main
5. Add secrets with Wrangler, never as plain variables:
   ```sh
   wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
   wrangler secret put GITHUB_APP_PRIVATE_KEY
   wrangler secret put SESSION_SECRET
   ```
   Supply the complete PEM contents for the private key. Generate a long random session secret, for example with openssl rand -base64 48.
6. Set window.VOID_TEXT_EDITOR_API in index.html to your deployed Worker origin, e.g. https://YOUR-WORKER.workers.dev. This value is public, not secret. Commit and deploy the site.
7. Ensure GitHub Pages deploys the built game from the configured branch/folder. The Worker commits to main by default.
8. Test with the authorized account, then test with a different GitHub account and confirm it is rejected.

## Usage

1. Open the published game.
2. Press Ctrl+Shift+D to open the developer panel.
3. Choose Sign in with GitHub and authenticate as the authorized account.
4. Press Ctrl+Shift+D again to enable Dev Mode.
5. Open a campaign dialogue scene. Use EDIT beside the dialogue line, apply a preview, then choose SAVE TO GITHUB.
6. Confirm the commit and wait for Pages deployment to finish.

Saving updates source and triggers deployment; already-open tabs will not automatically reload. Reload the game after deployment completes.

## Current scope and limitations

- Inline controls are provided for campaign/story dialogue rendered by the narrative system.
- Text-only saves to src/data/story.js are supported. Core/companion/perk descriptions, arbitrary UI labels, and gameplay values are not included yet.
- The Worker commits to the configured branch. If branch protection is enabled, change the implementation to create a branch and pull request.
- Configure Cloudflare rate limiting and review GitHub App permissions periodically.
