/**
 * Workers have no filesystem. Share-card lookups miss here so the baked
 * OG identity snapshot is what the response uses. Upload error 10021.
 */
function enoent(path) {
  const error = new Error(`ENOENT: no such file or directory, open '${path ?? ""}'`);
  error.code = "ENOENT";
  return error;
}

export function existsSync() {
  return false;
}

export function readFileSync(path) {
  throw enoent(path);
}

export function statSync(path) {
  throw enoent(path);
}

export function readdirSync() {
  return [];
}

export function mkdirSync() {}

export function writeFileSync() {
  throw enoent();
}

export const promises = {
  readFile(path) {
    return Promise.reject(enoent(path));
  },
  stat(path) {
    return Promise.reject(enoent(path));
  },
  access(path) {
    return Promise.reject(enoent(path));
  },
};

export default {
  existsSync,
  readFileSync,
  statSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  promises,
};
