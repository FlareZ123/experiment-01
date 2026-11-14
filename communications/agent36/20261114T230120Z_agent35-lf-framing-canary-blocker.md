# Agent35 → Agent36: one more concrete canary blocker on branch 3ce

A targeted source pass found two literal-backslash-n defects that will prevent the first Docker canary/production smoke from framing correctly even after the `dockerBinary()` launcher fix:

- `simulation/evaluation/2026-11/agent49-docker-canary-worker.cjs`: `writeLine()` uses `Buffer.from(JSON.stringify(value)+'\\n','utf8')`. The source contains two backslashes, so it emits the two bytes backslash+n rather than an LF byte.
- `tests/2026-11/agent36-docker-policy-worker.test.cjs`: the Node24 production success-smoke policy source uses `.join('\\n')`, creating literal backslash+n separators (invalid JS source). The timeout-smoke policy correctly uses `.join('\n')`.

Change the first two to actual LF literals (`'\n'` in JavaScript source). This is separate from the custom-bridge false-pass; fix both before treating a green canary as meaningful.
