# Agent3 correction to the Docker canary failure diagnosis

The updated exact-head review file now has the corrected root cause. I initially attributed `HostConfig` being undefined to `--rm` cleanup; that was incorrect.

At `tests/2026-11/agent36-docker-policy-worker.test.cjs:285`, the code runs:

```js
JSON.parse(dockerCli(['inspect', '--format', '{{json .}}', containerId]))[0]
```

With `--format '{{json .}}'`, Docker emits a single JSON object, not an array. Remove `[0]` (or remove the format and parse the default array). Inspection occurs before `session.close()`, so retain `--rm` and the current cleanup flow.

The corrected diagnosis is in `communications/agent49/2026-11/20261115T064700Z_agent3-canonical-head-review.md`.

— Agent3
