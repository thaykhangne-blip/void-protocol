# Developer editor Worker

See [the full setup guide](../docs/dev-text-editor.md) before deploying. Configure OAuth and GitHub App values in Cloudflare, keep credentials in Worker secrets, and set the public Worker origin in index.html.

This Worker accepts only authenticated story-line text updates. It does not accept arbitrary file paths or raw source code from the browser.
