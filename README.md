# mobile-software

One web codebase, three targets:

| Target    | Runtime                                  |
| --------- | ---------------------------------------- |
| Web       | Next.js 16 (App Router) + Tailwind CSS 4 |
| Desktop   | Electron                                 |
| Mobile    | Capacitor (Android + iOS)                |

The app is built as a **static export** (`output: "export"` → `out/`) so the desktop and
mobile shells can both load the exact same bundle.

## Requirements

- Node.js 20+ (developed on Node 24)
- Desktop: nothing extra, Electron ships with the dev dependencies
- Android: Android Studio + SDK (JDK 17+)
- iOS: Xcode (macOS only)

```bash
npm install
```

## Develop (web)

```bash
npm run dev     # http://localhost:3000
npm run lint
```

## Compile — Desktop (Electron)

Desktop builds are driven by npm scripts; nothing outside the repo is needed.

```bash
npm run electron:dev     # Next dev server + Electron window, with HMR
npm run electron:start   # production build (out/) + Electron window
```

`electron:start` runs `next build` and then launches Electron against `out/`. There is no
installer/packaging step yet — for a distributable you would add `electron-builder` (or
`@electron-forge/cli`), which needs the app icons described further down.

## Compile — Mobile (Capacitor)

Mobile needs the native toolchains, so the commands are split from the desktop ones.
Extra packages beyond Node are required; see [Requirements](#requirements).

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

The native projects are generated on demand and are not committed. Change `appId` /
`appName` in `capacitor.config.ts` before publishing.

## App icons and splash screens (resources)

Icons and splashes are generated with `@capacitor/assets` (already a dev dependency).
Put the source images in `assets/` at the repo root, using these exact names:

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
npm run mobile:assets                       # all platforms
npx capacitor-assets generate --android     # Android only
npx capacitor-assets generate --ios         # iOS only
npx capacitor-assets generate --pwa         # web manifest + icons
npx capacitor-assets generate --asset-path <dir>   # source images somewhere else
```

Output goes to `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`, so the
native project has to exist first (`mobile:add:android` / `mobile:add:ios`). With no
platform generated, only `--pwa` produces files.

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

## Desktop (Electron) internals

`electron/main.mjs` is the main process:

- In dev it loads the Next dev server (`ELECTRON_START_URL`, set by `electron:dev`).
- Otherwise it serves `out/` through a custom `app://bundle/` scheme, which keeps the
  absolute `/_next/...` asset URLs and client-side routing working.
- The window runs sandboxed with `contextIsolation` on and `nodeIntegration` off, and it
  has **no File/Edit/View/Window menu bar** (`Menu.setApplicationMenu(null)`).
- Relative links open in the system browser instead of new Electron windows.

Add IPC by introducing a `preload` script (`webPreferences.preload`) when you need
Node access from the renderer.

## Project structure

```
src/app/            Next.js App Router pages, layout and global styles
electron/main.mjs   Electron main process
capacitor.config.ts Capacitor (Android/iOS) configuration
next.config.ts      Static export + Tailwind/Turbopack config
public/             Static assets
assets/             Icon/splash sources for @capacitor/assets (create when needed)
out/                Build output consumed by Electron and Capacitor
android/ ios/       Generated native projects (not committed)
```

## Caveat: static export

Because the same bundle runs inside a WebView and an Electron window, server-only
Next.js features are unavailable: Route Handlers that read the request, cookies,
rewrites/redirects/headers, Server Actions, ISR, draft mode and the default image
optimizer. Build-time data fetching in Server Components still works.
