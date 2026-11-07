/**
 * Cross-platform Cloudflare build. `NITRO_PRESET=cloudflare` in package.json
 * is a Unix env assignment and does nothing useful in PowerShell/cmd.
 */
import { spawn } from "node:child_process";
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeAppEnv, projectRoot, readAppEnv } from "./with-app-env.mjs";

const project = projectRoot();

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".mjs") || name.endsWith(".js")) out.push(path);
  }
  return out;
}

const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const child = spawn(process.execPath, [viteBin, "build"], {
  cwd: project,
  stdio: "inherit",
  env: mergeAppEnv(readAppEnv(project), { ...process.env, NITRO_PRESET: "cloudflare" }),
});

child.on("exit", (code, signal) => {
  if (signal || code) {
    process.exit(code ?? 1);
  }
  const serverDir = join(project, ".output", "server");
  const stubName = "cf-fs-stub.mjs";
  copyFileSync(join(project, "scripts", "cf-node-fs-stub.mjs"), join(serverDir, stubName));
  const offenders = [];
  for (const file of walk(serverDir)) {
    if (file.endsWith(stubName)) continue;
    let text = readFileSync(file, "utf8");
    if (!text.includes("node:fs") && !/from\s+["']fs["']/.test(text)) continue;
    const spec = relative(dirname(file), join(serverDir, stubName)).replaceAll("\\", "/");
    const from = spec.startsWith(".") ? spec : `./${spec}`;
    text = text.replace(/from\s*(["'])node:fs(?:\/promises)?\1/g, `from "${from}"`);
    text = text.replace(/from\s*(["'])fs(?:\/promises)?\1/g, `from "${from}"`);
    writeFileSync(file, text);
    if (text.includes("node:fs") || /from\s+["']fs["']/.test(text)) offenders.push(file);
  }
  if (offenders.length) {
    console.error("Cloudflare bundle still imports node:fs:");
    for (const file of offenders) console.error("  " + file);
    process.exit(1);
  }
  console.log("Cloudflare bundle has no node:fs import.");
  syncSsrStylesheet(project);
  attachEntitlementsKv(project);
});

/**
 * Vite hashes CSS twice: the client file in `.output/public` and a different
 * name baked into the SSR router. The HTML then links a stylesheet that 404s,
 * so the page stays unstyled until the JS bundle rewrites the tag.
 * Point every server reference at the file that actually ships.
 */
function syncSsrStylesheet(root) {
  const assetsDir = join(root, ".output", "public", "assets");
  const cssFiles = readdirSync(assetsDir).filter((name) => /^styles-[A-Za-z0-9_-]+\.css$/.test(name));
  if (cssFiles.length !== 1) {
    console.error("Expected one public styles-*.css, found:", cssFiles);
    process.exit(1);
  }
  const real = `/assets/${cssFiles[0]}`;
  let replaced = 0;
  for (const file of walk(join(root, ".output", "server"))) {
    const text = readFileSync(file, "utf8");
    const next = text.replace(/\/assets\/styles-[A-Za-z0-9_-]+\.css/g, (match) => {
      if (match === real) return match;
      replaced += 1;
      return real;
    });
    if (next !== text) writeFileSync(file, next);
  }
  console.log(`SSR stylesheet href is ${real} (${replaced} stale reference${replaced === 1 ? "" : "s"} rewritten).`);
}

function attachEntitlementsKv(root) {
  const file = join(root, ".output", "server", "wrangler.json");
  const json = JSON.parse(readFileSync(file, "utf8"));
  json.kv_namespaces = [{ binding: "ENTITLEMENTS", id: "2cb50db5d6f44624b17a6327db457531" }];
  json.send_email = [
    {
      name: "EMAIL",
      destination_address: "tomirios2005@gmail.com",
      allowed_sender_addresses: ["hola@lacajaclara.com.ar"],
    },
  ];
  writeFileSync(file, JSON.stringify(json, null, 2));
  console.log("Worker KV binding ENTITLEMENTS and EMAIL attached.");
}
