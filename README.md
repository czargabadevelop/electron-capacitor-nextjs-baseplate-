# Electron + Capacitor + Next.js Baseplate

> One Next.js codebase, three targets: **Web**, **Desktop (Electron)** and **Mobile (Android + iOS via Capacitor)**.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Electron](https://img.shields.io/badge/Electron-45-47848F?logo=electron&logoColor=white)](https://www.electronjs.org)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

[![GitHub stars](https://img.shields.io/github/stars/czargabadevelop/electron-capacitor-nextjs-baseplate-?style=social)](https://github.com/czargabadevelop/electron-capacitor-nextjs-baseplate-/stargazers)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-PayPal-00457C?logo=paypal&logoColor=white)](https://paypal.me/appleideath)

A minimal, batteries-included starting point for shipping a single React/Next.js app as a
website, a desktop application, and a native mobile app — without maintaining three separate
frontends.

Everything is wired so the **same static export** (`out/`) is what Electron loads on the
desktop and what Capacitor packages into the Android and iOS shells.

---

## Table of contents

- [Why this baseplate](#why-this-baseplate)
- [Targets](#targets)
- [Tech stack](#tech-stack)
- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Develop (web)](#develop-web)
- [Desktop (Electron)](#desktop-electron)
- [Mobile (Capacitor)](#mobile-capacitor)
- [App icons and splash screens](#app-icons-and-splash-screens)
- [Scripts reference](#scripts-reference)
- [Project structure](#project-structure)
- [How each target works](#how-each-target-works)
- [Static export caveats](#static-export-caveats)
- [Support this project](#support-this-project)
- [Author](#author)
- [License](#license)

## Why this baseplate

- **One codebase, three platforms.** Write React once; Electron and Capacitor reuse the exact
  same build output.
- **Static export by default.** `output: "export"` means no Node server is required at runtime,
  which is what makes the desktop and mobile shells possible.
- **Desktop-grade Electron shell.** Sandboxed renderer, `contextIsolation` on, `nodeIntegration`
  off, no menu bar, and a custom `app://bundle/` protocol so Next.js absolute asset paths and
  client-side routing survive inside a packaged app.
- **Mobile-ready Capacitor config.** `webDir` already points at `out/`, with scripts for syncing,
  generating native projects, and building icons/splashes.
- **Typed and linted.** TypeScript strict mode, ESLint flat config with Next.js core-web-vitals
  and TypeScript rules, Tailwind CSS 4 for styling.
- **No lock-in.** No packaging service, no proprietary runtime — just Node, Electron and
  Capacitor.

## Targets

| Target      | Runtime                                  | Build output | How it runs                                     |
| ----------- | ---------------------------------------- | ------------ | ----------------------------------------------- |
| **Web**     | Next.js 16 (App Router) + Tailwind CSS 4  | `out/`       | Any static host, `npm run dev` locally           |
| **Desktop** | Electron                                 | `out/`       | Custom `app://bundle/` scheme, no local server   |
| **Mobile**  | Capacitor (Android + iOS)                | `out/`       | Copied into the native project by `cap sync`     |

## Tech stack

| Layer      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Framework  | [Next.js](https://nextjs.org) 16 (App Router, Turbopack)   |
| UI         | [React](https://react.dev) 19                              |
| Styling    | [Tailwind CSS](https://tailwindcss.com) 4                  |
| Language   | [TypeScript](https://www.typescriptlang.org) 5 (strict)    |
| Desktop    | [Electron](https://www.electronjs.org) 45                  |
| Mobile     | [Capacitor](https://capacitorjs.com) 8 (`core`, `android`, `ios`) |
| Linting    | ESLint 9 (flat config) + `eslint-config-next`              |
| Asset gen  | `@capacitor/assets`                                        |

## Requirements

- **Node.js 20+** (developed on Node 24)
- **Desktop:** nothing extra — Electron ships as a dev dependency
- **Android:** Android Studio + Android SDK (JDK 17+)
- **iOS:** Xcode, macOS only

## Getting started

```bash
git clone https://github.com/czargabadevelop/electron-capacitor-nextjs-baseplate-.git
cd electron-capacitor-nextjs-baseplate-
npm install
```

Then pick a target below, or just start the web app:

```bash
npm run dev    # http://localhost:3000
```

Before shipping your own app, change these:

| File                    | What to change                                        |
| ----------------------- | ----------------------------------------------------- |
| `package.json`          | `name`, `version`                                     |
| `capacitor.config.ts`   | `appId`, `appName`                                    |
| `src/app/layout.tsx`    | `metadata` (`title`, `description`)                   |
| `src/app/page.tsx`      | Replace the starter screen with your own              |

## Develop (web)

```bash
npm run dev     # http://localhost:3000
npm run lint    # ESLint (Next.js + TypeScript rules)
npm run build   # static export into out/
```

## Desktop (Electron)

Desktop builds are driven entirely by npm scripts; nothing outside the repo is needed.

```bash
npm run electron:dev     # Next dev server + Electron window, with HMR
npm run electron:start   # production build (out/) + Electron window
```

`electron:start` runs `next build` and then launches Electron against `out/`. There is no
installer/packaging step yet — for a distributable you would add
[`electron-builder`](https://www.electron.build) or
[`@electron-forge/cli`](https://www.electronforge.io), which needs the app icons described
[below](#app-icons-and-splash-screens).

## Mobile (Capacitor)

Mobile needs the native toolchains, so its commands are kept separate from the desktop ones.
See [Requirements](#requirements) for what must be installed.

### Android

```bash
npm run mobile:add:android   # one-off: generates android/
npm run mobile:sync          # after every web change: build out/ + copy into android/
npm run mobile:android       # open android/ in Android Studio, then Run ▶
```

Build from the terminal instead of the IDE:

```bash
npx cap run android            # build and deploy to a connected device/emulator
npx cap build android          # release build (needs a signing config)
```

### iOS

```bash
npm run mobile:add:ios       # one-off: generates ios/ (macOS only)
npm run mobile:sync
npm run mobile:ios           # open ios/ in Xcode, then Run ▶
```

```bash
npx cap run ios
npx cap build ios
```

The native projects (`android/`, `ios/`) are generated on demand and are **not committed**.
Change `appId` / `appName` in `capacitor.config.ts` before publishing.

## App icons and splash screens

Icons and splashes are generated with `@capacitor/assets` (already a dev dependency). Put the
source images in `assets/` at the repo root, using these exact names:

```
assets/
├── icon-only.png        # 1024×1024 — square app icon
├── icon-foreground.png  # 1024×1024 — Android adaptive icon foreground
├── icon-background.png  # 1024×1024 — Android adaptive icon background
├── splash.png           # 2732×2732 — light splash
└── splash-dark.png      # 2732×2732 — dark splash
```

PNG or JPG, at least those sizes. Then generate:

```bash
npm run mobile:assets                              # all platforms
npx capacitor-assets generate --android            # Android only
npx capacitor-assets generate --ios                # iOS only
npx capacitor-assets generate --pwa                # web manifest + icons
npx capacitor-assets generate --asset-path <dir>   # source images somewhere else
```

Output goes to `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`, so the native
project has to exist first (`mobile:add:android` / `mobile:add:ios`). With no platform
generated, only `--pwa` produces files.

Notes:

- Android 12+ ignores the full-bleed splash image and shows the adaptive icon on a solid
  background instead, so `icon-foreground.png` / `icon-background.png` matter most there.
- `--pwa` does not produce the desktop icon; Electron packaging needs its own icon file.

## Scripts reference

| Script                       | What it does                                    |
| ---------------------------- | ----------------------------------------------- |
| `npm run dev`                | Next.js dev server on http://localhost:3000     |
| `npm run build`              | Static export into `out/`                       |
| `npm run lint`               | ESLint (Next.js + TypeScript rules)             |
| `npm run electron:dev`       | Next dev server + Electron window with HMR      |
| `npm run electron:start`     | Production build + Electron window              |
| `npm run mobile:add:android` | Generate the Android project (`android/`)       |
| `npm run mobile:add:ios`     | Generate the iOS project (`ios/`)               |
| `npm run mobile:sync`        | Build the export and copy it into the platforms |
| `npm run mobile:assets`      | Generate app icons and splash screens           |
| `npm run mobile:android`     | Open the Android project in Android Studio      |
| `npm run mobile:ios`         | Open the iOS project in Xcode                   |

## Project structure

```
src/app/            Next.js App Router pages, layout and global styles
electron/main.mjs   Electron main process
capacitor.config.ts Capacitor (Android/iOS) configuration
next.config.ts      Static export + Tailwind/Turbopack config
public/             Static assets
assets/             Icon/splash sources for @capacitor/assets (create when needed)
out/                Build output consumed by Electron and Capacitor (generated)
android/ ios/       Generated native projects (not committed)
```

## How each target works

**Web.** A standard Next.js App Router app. `next.config.ts` sets `output: "export"` and
`trailingSlash: true` so every route is emitted as `<route>/index.html`, and
`images.unoptimized` because there is no image optimizer at runtime.

**Desktop.** `electron/main.mjs` is the main process:

- In dev it loads the Next dev server (`ELECTRON_START_URL`, set by `electron:dev`).
- Otherwise it serves `out/` through a custom `app://bundle/` scheme, which keeps the absolute
  `/_next/...` asset URLs and client-side routing working.
- The window is sandboxed with `contextIsolation` on and `nodeIntegration` off, and it has
  **no File/Edit/View/Window menu bar** (`Menu.setApplicationMenu(null)`).
- External links open in the system browser instead of new Electron windows.
- Static file resolution refuses anything outside `out/`.

Add IPC by introducing a `preload` script (`webPreferences.preload`) when you need Node access
from the renderer.

**Mobile.** Capacitor points `webDir` at `out/`. `npm run mobile:sync` rebuilds the export and
copies it into the generated native projects, which then run it in a WebView.

## Static export caveats

Because the same bundle runs inside a WebView and an Electron window, server-only Next.js
features are unavailable:

- Route Handlers that read the request
- `cookies()` / `headers()` and request-time data
- `rewrites`, `redirects`, `headers`
- Server Actions
- ISR and draft mode
- the default image optimizer

Build-time data fetching in Server Components still works.

## Support this project

If this baseplate saved you some setup time:

- ⭐ **Star the repo** — it genuinely helps others find it:
  [github.com/czargabadevelop/electron-capacitor-nextjs-baseplate-](https://github.com/czargabadevelop/electron-capacitor-nextjs-baseplate-)
- ☕ **Buy me a coffee** — [paypal.me/appleideath](https://paypal.me/appleideath)

[![Star this repo](https://img.shields.io/badge/⭐-Star_this_repo-yellow?style=for-the-badge)](https://github.com/czargabadevelop/electron-capacitor-nextjs-baseplate-/stargazers)
[![Buy me a coffee](https://img.shields.io/badge/☕-Buy_me_a_coffee-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/appleideath)

## Author

**Czar G**

- Website: [czar.dev](https://czar.dev/)
- GitHub: [@czargabadevelop](https://github.com/czargabadevelop)
- PayPal: [paypal.me/appleideath](https://paypal.me/appleideath)

## License

Released under the [MIT License](LICENSE) © Czar G.
