import assert from "node:assert/strict";
import { test } from "node:test";
import worker from "../worker/index.ts";

test("forwards the original API request and streaming response without buffering", async () => {
  const request = new Request("https://origin89.com/api/buddy/chat?session=test", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "session=test" },
    body: '{"message":"hello"}',
  });
  let controller;
  const stream = new ReadableStream({
    start(value) {
      controller = value;
    },
  });
  const response = new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Set-Cookie": "session=next" },
  });
  const result = await worker.fetch(request, {
    BUDDY: {
      async fetch(forwarded) {
        assert.equal(forwarded, request);
        assert.equal(await forwarded.text(), '{"message":"hello"}');
        return response;
      },
    },
    ASSETS: {
      fetch() {
        assert.fail("API requests must not reach assets");
      },
    },
  });
  assert.equal(result, response);
  assert.equal(result.headers.get("Set-Cookie"), "session=next");
  controller.enqueue(new TextEncoder().encode("data: hello\n\n"));
  controller.close();
  assert.equal(await result.text(), "data: hello\n\n");
});

test("passes asset and non-matching API paths to the asset binding", async () => {
  for (const path of [
    "/",
    "/missing/",
    "/api/buddy",
    "/api/buddy-other/status",
    "/api/waitlist/",
    "/api/waitlist-other",
  ]) {
    const request = new Request(`https://origin89.com${path}`);
    const response = new Response("asset result", { status: 404 });
    assert.equal(
      await worker.fetch(request, {
        BUDDY: {
          fetch() {
            assert.fail(`Must not forward ${path} to Buddy`);
          },
        },
        ASSETS: {
          async fetch(forwarded) {
            assert.equal(forwarded, request);
            return response;
          },
        },
      }),
      response,
    );
  }
});

test("preserves backend failure responses and propagates binding failures", async () => {
  const request = new Request("https://origin89.com/api/buddy/status");
  const response = new Response("unavailable", { status: 503 });
  assert.equal(await worker.fetch(request, { BUDDY: { fetch: async () => response } }), response);
  const failure = new Error("binding unavailable");
  await assert.rejects(
    worker.fetch(request, {
      BUDDY: {
        fetch: async () => {
          throw failure;
        },
      },
    }),
    (error) => error === failure,
  );
});

test("handles the waitlist path in the worker without reaching Buddy or assets", async () => {
  const response = await worker.fetch(new Request("https://origin89.com/api/waitlist"), {
    BUDDY: { fetch: () => assert.fail("Must not forward the waitlist to Buddy") },
    ASSETS: { fetch: () => assert.fail("Must not serve the waitlist from assets") },
  });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
});
