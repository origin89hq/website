import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "jsonc-parser";

const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
const namePattern = /^[a-z][a-z0-9-]{0,62}$/;

function reader(env) {
  return (key, pattern) => {
    const value = env[key];
    if (typeof value !== "string" || !pattern.test(value))
      throw new Error(`Missing or invalid ${key}`);
    return value;
  };
}

/** The website: the hostname, the assets, one binding to Buddy and the waitlist vars. */
export function websiteConfig(base, env) {
  const requireValue = reader(env);
  const account = requireValue("CLOUDFLARE_ACCOUNT_ID", /^[a-f0-9]{32}$/);
  const hostname = requireValue("BUDDY_HOSTNAME", hostnamePattern);
  const alias = env.BUDDY_ALIAS_HOSTNAME
    ? requireValue("BUDDY_ALIAS_HOSTNAME", hostnamePattern)
    : undefined;
  const name = requireValue("WEBSITE_WORKER_NAME", namePattern);
  const buddy = requireValue("BUDDY_WORKER_NAME", namePattern);
  const config = structuredClone(base);
  delete config.env;
  const hostnames = [...new Set([hostname, alias].filter(Boolean))];
  return {
    ...config,
    name,
    account_id: account,
    workers_dev: false,
    preview_urls: false,
    routes: hostnames.map((pattern) => ({ pattern, custom_domain: true })),
    services: [{ binding: "BUDDY", service: buddy }],
    // Production accepts Turnstile tokens only from its own hostnames.
    vars: { ...config.vars, TURNSTILE_HOSTNAMES: hostnames.join(",") },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = [];
  const base = parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"), errors);
  if (errors.length) throw new Error("Invalid Wrangler config");
  const config = websiteConfig(base, process.env);
  await writeFile(
    new URL("../wrangler.deploy.json", import.meta.url),
    JSON.stringify(config, null, 2) + "\n",
  );
  console.log(`Prepared ${config.name}; no resources created or deployed.`);
}
