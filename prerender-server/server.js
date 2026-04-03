/**
 * Prerender must load env before `require('prerender')` so lib/server.js picks up timeouts.
 */
require("dotenv").config();

const fs = require("fs");

process.env.PRERENDER_NUM_WORKERS = process.env.PRERENDER_NUM_WORKERS || "2";
process.env.PAGE_LOAD_TIMEOUT = process.env.PAGE_LOAD_TIMEOUT || "20000";

/**
 * Full path to chrome.exe. Prerender's Windows default only checks Program Files (x86);
 * 64-bit Chrome is usually under "Program Files" — match Explorer: ...\Application\chrome.exe
 * Use forward slashes or path.join so backslashes are not interpreted as JS escapes.
 */
function resolveChromeLocation() {
  if (process.env.CHROME_PATH) {
    const p = process.env.CHROME_PATH.trim();
    if (fs.existsSync(p)) {
      return p;
    }
    console.warn("[prerender] CHROME_PATH does not exist:", p);
  }
  if (process.platform === "win32") {
    const candidates = [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
    return candidates[0];
  }
  return undefined;
}

const prerender = require("prerender");
const pathWhitelist = require("./plugins/pathWhitelist");
const inMemoryHtmlCache = require("./plugins/inMemoryHtmlCache");

const PORT = parseInt(process.env.PORT || "3000", 10);
const chromeLocation = resolveChromeLocation();

const server = prerender({
  port: PORT,
  chromeLocation,
  pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT || "20000", 10),
});

server.use({
  requestReceived: (req, res, next) => {
    console.log(`[prerender] ${new Date().toISOString()} ${req.prerender.url}`);
    next();
  },
});

server.use(pathWhitelist);
server.use(inMemoryHtmlCache);

server.use(prerender.sendPrerenderHeader());
server.use(prerender.browserForceRestart());
server.use(prerender.addMetaTags());
server.use(prerender.removeScriptTags());
server.use(prerender.httpHeaders());

server.start();
