# Outline

A short, browser-based guided intake for turning a rough project idea into an editable project brief. It begins with the idea, audience, and intended change, then narrows into project shape and practical details. The deliverable prompt adapts to digital products, events, physical projects, services, or other projects.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the URL Vite prints. Run `npm test` for the flow and export tests, and `npm run build` to produce a static site in `dist/`.

## Windows desktop app

On Windows, run `npm run package:win` after `npm install`. The portable executable is written to `release/Outline-1.0.0-portable.exe`; it runs without Node.js or an installer on the customer's machine. Use `npm run desktop` to preview the desktop wrapper locally.

For **testing on this Windows account only**, run `npm run package:win:local` to build and sign in one step, or `npm run sign:local` after `npm run package:win`. The signing command creates or reuses a non-exportable self-signed certificate named `BigSoy Studios Outline Local Test`, adds its public certificate to **CurrentUser** Root and TrustedPublisher, and signs the EXE. Check it with `Get-AuthenticodeSignature .\release\Outline-1.0.0-portable.exe` in PowerShell; its status should be `Valid`. A rebuild with `npm run package:win` replaces the signed EXE, so sign again afterward.

This is **not** a publicly trusted code-signing certificate. Trust applies only to this Windows account, and SmartScreen can still flag an unfamiliar EXE because reputation is separate from signature trust. Do not share this test-signed EXE as a release. To remove local trust later, find its thumbprint in `Cert:\CurrentUser\My` and remove that thumbprint from `Cert:\CurrentUser\My`, `Cert:\CurrentUser\Root`, and `Cert:\CurrentUser\TrustedPublisher` using PowerShell's certificate provider. This also removes the signing key from your account.

The desktop app keeps its draft in its own local app data, separate from the browser draft. It never starts a web server or sends answers online. Copy and Markdown download work in the desktop window too.

Customers can skip optional answers, mark them "Not sure yet", or create a brief early. The brief lists missing details as open questions; answer and edit links return to the relevant prompt. Copy exports Markdown to the clipboard, and Download saves a `.md` file.

Draft answers are stored only in this browser's local storage. The app has no backend, analytics, account, or submission endpoint. Use **Clear draft** on a shared device. Downloaded files and copied text remain wherever the customer saves or pastes them.