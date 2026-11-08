#!/usr/bin/env node
// Creates admin login credentials for the dashboard.
//   npm run admin:setup            → prints the env lines to paste into Hostinger
//   npm run admin:setup -- --write → also saves them to .env.local (this computer)
import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

const scrypt = (pw, salt) =>
  new Promise((res, rej) => scryptCb(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))));

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) stdout.write(s);
        else stdout.write(s.replace(/[^\r\n]/g, "•"));
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) stdout.write("\n");
      resolve(answer);
    });
  });
}

const username = (await ask("Admin username: ")).trim();
if (!username) process.exit(console.error("Username is required."), 1);
const password = await ask("Password (min 12 characters): ", { hidden: true });
if (password.length < 12) process.exit(console.error("Use at least 12 characters."), 1);
if ((await ask("Repeat password: ", { hidden: true })) !== password) process.exit(console.error("Passwords don't match."), 1);

const salt = randomBytes(16);
const hash = ["scrypt", 16384, 8, 1, salt.toString("base64url"), (await scrypt(password, salt)).toString("base64url")].join(":");
const lines = {
  ADMIN_USERNAME: username,
  ADMIN_PASSWORD_HASH: hash,
  SESSION_SECRET: randomBytes(48).toString("base64url"),
};
const block = Object.entries(lines)
  .map(([k, v]) => `${k}=${v}`)
  .join("\n");

console.log("\nAdd these as environment variables (Hostinger → your Node.js app → Environment variables):\n");
console.log(block);
console.log("\nKeep them secret. Never commit them. Changing the password logs out existing sessions.");

if (process.argv.includes("--write")) {
  const file = ".env.local";
  let text = existsSync(file) ? readFileSync(file, "utf8") : "";
  for (const [k, v] of Object.entries(lines)) {
    const re = new RegExp(`^${k}=.*$`, "m");
    text = re.test(text) ? text.replace(re, `${k}=${v}`) : `${text}${text && !text.endsWith("\n") ? "\n" : ""}${k}=${v}\n`;
  }
  writeFileSync(file, text);
  console.log(`\nSaved to ${file} for local use.`);
}
