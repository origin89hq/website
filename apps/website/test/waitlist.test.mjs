import assert from "node:assert/strict";
import { test } from "node:test";
import { handleWaitlist, TURNSTILE_ACTION, WAITLIST_TAG } from "../worker/waitlist.ts";

const env = {
  MAILCHIMP_API_KEY: "0123456789abcdef-us21",
  MAILCHIMP_AUDIENCE_ID: "614c5bde81",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  TURNSTILE_HOSTNAMES: "origin89.com, www.origin89.com",
};
const siteverify = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const members = "https://us21.api.mailchimp.com/3.0/lists/614c5bde81/members";
const passed = { success: true, action: TURNSTILE_ACTION, hostname: "origin89.com" };

function signup(body, init = {}) {
  return new Request("https://origin89.com/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.7" },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

/** Answers siteverify and Mailchimp in order and records each call. */
function upstream(...answers) {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    const answer = answers.shift();
    if (!answer) assert.fail(`Unexpected request to ${url}`);
    if (answer instanceof Error) throw answer;
    return Response.json(answer.body ?? {}, { status: answer.status ?? 200 });
  };
  return { calls, fetcher };
}

async function expectError(response, status, error) {
  assert.equal(response.status, status);
  assert.deepEqual(await response.json(), { error });
}

test("verifies the token, then adds the address as pending with the waitlist tag", async () => {
  const { calls, fetcher } = upstream({ body: passed }, { body: { id: "member" } });
  const response = await handleWaitlist(
    signup({ email: "  sam@example.com ", token: "token-1" }),
    env,
    fetcher,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });

  assert.equal(calls[0].url, siteverify);
  assert.deepEqual(Object.fromEntries(calls[0].init.body), {
    secret: "turnstile-secret",
    response: "token-1",
    remoteip: "203.0.113.7",
  });
  assert.equal(calls[1].url, members);
  assert.equal(calls[1].init.method, "POST");
  assert.equal(
    calls[1].init.headers.Authorization,
    `Basic ${btoa("origin89:0123456789abcdef-us21")}`,
  );
  assert.deepEqual(JSON.parse(calls[1].init.body), {
    email_address: "sam@example.com",
    status: "pending",
    tags: [WAITLIST_TAG],
  });
});

test("gives an existing contact the same reply without changing it", async () => {
  const { calls, fetcher } = upstream(
    { body: { ...passed, hostname: "www.origin89.com" } },
    { status: 400, body: { title: "Member Exists" } },
  );
  const response = await handleWaitlist(
    signup({ email: "sam@example.com", token: "t" }),
    env,
    fetcher,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  assert.equal(calls.length, 2);
});

test("rejects malformed requests before calling Turnstile or Mailchimp", async () => {
  const { calls, fetcher } = upstream();
  const get = await handleWaitlist(new Request("https://origin89.com/api/waitlist"), env, fetcher);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("Allow"), "POST");

  const cases = [
    [
      signup("email=sam@example.com", { headers: { "Content-Type": "text/plain" } }),
      400,
      "invalid_request",
    ],
    [signup("{not json"), 400, "invalid_request"],
    [signup("[]"), 400, "invalid_request"],
    [signup({ email: "sam@example.com", token: "x".repeat(5000) }), 400, "invalid_request"],
    [signup({ email: "not-an-address", token: "t" }), 400, "invalid_email"],
    [signup({ email: `${"a".repeat(250)}@example.com`, token: "t" }), 400, "invalid_email"],
    [signup({ token: "t" }), 400, "invalid_email"],
    [signup({ email: "sam@example.com" }), 403, "verification_failed"],
    [signup({ email: "sam@example.com", token: "" }), 403, "verification_failed"],
  ];
  for (const [request, status, error] of cases) {
    await expectError(await handleWaitlist(request, env, fetcher), status, error);
  }
  assert.equal(calls.length, 0);
});

test("refuses tokens that failed, belong to another action or come from another hostname", async () => {
  for (const result of [
    { success: false, "error-codes": ["timeout-or-duplicate"] },
    { ...passed, action: "login" },
    { ...passed, action: undefined },
    { ...passed, hostname: "localhost" },
    { success: true, hostname: "example.com" },
  ]) {
    const { calls, fetcher } = upstream({ body: result });
    await expectError(
      await handleWaitlist(signup({ email: "sam@example.com", token: "t" }), env, fetcher),
      403,
      "verification_failed",
    );
    assert.equal(calls.length, 1, "Mailchimp must not be called");
  }
});

test("reports Turnstile and Mailchimp outages as unavailable and refused addresses as rejected", async (t) => {
  t.mock.method(console, "error", () => {});
  const request = () => signup({ email: "sam@example.com", token: "t" });
  const cases = [
    [[new TypeError("network down")], 503, "unavailable"],
    [[{ status: 500 }], 503, "unavailable"],
    [[{ body: passed }, { status: 400, body: { title: "Invalid Resource" } }], 422, "rejected"],
    [
      [{ body: passed }, { status: 400, body: { title: "Forgotten Email Not Subscribed" } }],
      422,
      "rejected",
    ],
    [[{ body: passed }, { status: 401, body: { title: "API Key Invalid" } }], 503, "unavailable"],
    [[{ body: passed }, { status: 429 }], 503, "unavailable"],
    [[{ body: passed }, new TypeError("network down")], 503, "unavailable"],
  ];
  for (const [answers, status, error] of cases) {
    const { calls, fetcher } = upstream(...answers);
    await expectError(await handleWaitlist(request(), env, fetcher), status, error);
    assert.equal(calls.length, answers.length);
  }
});

test("stays unavailable without complete configuration", async (t) => {
  t.mock.method(console, "error", () => {});
  const { calls, fetcher } = upstream();
  for (const missing of [
    { MAILCHIMP_API_KEY: undefined },
    { MAILCHIMP_API_KEY: "key-without-data-center-" },
    { MAILCHIMP_AUDIENCE_ID: "" },
    { TURNSTILE_SECRET_KEY: undefined },
    { TURNSTILE_HOSTNAMES: " , " },
  ]) {
    await expectError(
      await handleWaitlist(
        signup({ email: "sam@example.com", token: "t" }),
        { ...env, ...missing },
        fetcher,
      ),
      503,
      "unavailable",
    );
  }
  assert.equal(calls.length, 0);
});
