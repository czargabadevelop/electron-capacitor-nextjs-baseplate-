import { app, BrowserWindow, Menu, protocol, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";

const DEV_URL = process.env.ELECTRON_START_URL;
const OUT_DIR = path.join(import.meta.dirname, "..", "out");

// Next.js references assets from the site root (`/_next/...`), which does not
// work over `file://`. Serving `out/` through a custom standard scheme keeps
// those absolute paths and client-side routing intact.
const SCHEME = "app";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

async function resolveStaticFile(pathname) {
  const target = path.join(OUT_DIR, decodeURIComponent(pathname));

  // Never serve anything outside of the exported bundle.
  if (target !== OUT_DIR && !target.startsWith(OUT_DIR + path.sep)) {
    return null;
  }

  const candidates = [target];
  if (!path.extname(target)) {
    candidates.push(path.join(target, "index.html"), `${target}.html`);
  }

  for (const candidate of candidates) {
    const stat = await fs.stat(candidate).catch(() => null);
    if (stat?.isFile()) {
      return candidate;
    }
  }

  return null;
}

function registerBundleProtocol() {
  protocol.handle(SCHEME, async (request) => {
    const { pathname } = new URL(request.url);
    const filePath = await resolveStaticFile(pathname);

    if (!filePath) {
      const notFound = await fs
        .readFile(path.join(OUT_DIR, "404.html"))
        .catch(() => Buffer.from("Not found"));
      return new Response(notFound, {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    const body = await fs.readFile(filePath);
    const contentType =
      MIME_TYPES[path.extname(filePath).toLowerCase()] ??
      "application/octet-stream";

    return new Response(body, { headers: { "content-type": contentType } });
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 400,
    minHeight: 400,
    show: false,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.once("ready-to-show", () => win.show());

  // Keep external links in the user's browser instead of spawning windows.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (DEV_URL) {
    await win.loadURL(DEV_URL);
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadURL(`${SCHEME}://bundle/`);
  }
}

app.whenReady().then(async () => {
  // No File/Edit/View/Window menu bar on the app window.
  Menu.setApplicationMenu(null);

  if (!DEV_URL) {
    registerBundleProtocol();
  }

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
