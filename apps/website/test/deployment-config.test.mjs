import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parse } from "jsonc-parser";
import { websiteConfig } from "../scripts/deployment-config.mjs";

test("the website's remote config takes the hostname and binds the Buddy it names", () => {
  const errors = [];
  const base = parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"), errors);
  assert.deepEqual(errors, []);
  const env = {
    CLOUDFLARE_ACCOUNT_ID: "a".repeat(32),
    WEBSITE_WORKER_NAME: "website-test",
    BUDDY_WORKER_NAME: "buddy-test",
    BUDDY_HOSTNAME: "preview.origin89.com",
  };
  const config = websiteConfig(base, env);
  for (const key of Object.keys(env))
    assert.throws(() => websiteConfig(base, { ...env, [key]: "" }), new RegExp(key));
  assert.throws(() => websiteConfig(base, { ...env, BUDDY_HOSTNAME: "https://origin89.com/path" }));
  assert.equal(config.env, undefined);
  for (const key of ["main", "assets", "compatibility_date"])
    assert.deepEqual(config[key], base[key]);
  assert.deepEqual(config.routes, [{ pattern: "preview.origin89.com", custom_domain: true }]);
  assert.deepEqual(
    websiteConfig(base, {
      ...env,
      BUDDY_HOSTNAME: "origin89.com",
      BUDDY_ALIAS_HOSTNAME: "buddy.origin89.com",
    }).routes,
    [
      { pattern: "origin89.com", custom_domain: true },
      { pattern: "buddy.origin89.com", custom_domain: true },
    ],
  );
  assert.deepEqual(
    websiteConfig(base, { ...env, BUDDY_ALIAS_HOSTNAME: env.BUDDY_HOSTNAME }).routes,
    config.routes,
  );
  assert.throws(
    () => websiteConfig(base, { ...env, BUDDY_ALIAS_HOSTNAME: "https://buddy.origin89.com/" }),
    /BUDDY_ALIAS_HOSTNAME/,
  );
  // The deployed binding must name the deployed Buddy, not the local one the
  // checked-in config carries, or the site answers 503 for every API call.
  assert.deepEqual(config.services, [{ binding: "BUDDY", service: "buddy-test" }]);
  assert.notDeepEqual(config.services, base.services);
  assert.equal(config.workers_dev, false);
});

test("the deployed waitlist accepts Turnstile tokens only from the website's hostnames", () => {
  const base = parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  const env = {
    CLOUDFLARE_ACCOUNT_ID: "a".repeat(32),
    WEBSITE_WORKER_NAME: "website-test",
    BUDDY_WORKER_NAME: "buddy-test",
    BUDDY_HOSTNAME: "origin89.com",
  };
  assert.match(base.vars.TURNSTILE_HOSTNAMES, /localhost/);
  // Wrangler refuses a deploy that would leave these unset.
  assert.deepEqual(websiteConfig(base, env).secrets, {
    required: ["MAILCHIMP_API_KEY", "TURNSTILE_SECRET_KEY"],
  });
  assert.equal(base.env.fixture.vars.MAILCHIMP_AUDIENCE_ID, base.vars.MAILCHIMP_AUDIENCE_ID);
  assert.deepEqual(websiteConfig(base, env).vars, {
    MAILCHIMP_AUDIENCE_ID: base.vars.MAILCHIMP_AUDIENCE_ID,
    TURNSTILE_HOSTNAMES: "origin89.com",
  });
  assert.equal(
    websiteConfig(base, { ...env, BUDDY_ALIAS_HOSTNAME: "www.origin89.com" }).vars
      .TURNSTILE_HOSTNAMES,
    "origin89.com,www.origin89.com",
  );
  assert.equal(
    websiteConfig(base, { ...env, BUDDY_ALIAS_HOSTNAME: "origin89.com" }).vars.TURNSTILE_HOSTNAMES,
    "origin89.com",
  );
});
