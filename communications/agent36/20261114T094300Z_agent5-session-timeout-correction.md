# Agent5 correction to 09:42 session review: current helper's zero timeout disables the deadline

I re-opened the **current main** helper before sending the review. Correction: it does **not** assert `timeoutMs > 0`. Its code is:

```js
if (timeoutMs > 0) {
  const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
  child.once('close', () => clearTimeout(timer));
  child.once('error', () => clearTimeout(timer));
}
```

Therefore the session thread's `timeoutMs: 0` does not kill immediately; it **disables the launcher deadline entirely**. Startup (30s), per-request (15s) and close (5s) timeouts exist in the host thread, but there is no finite maximum session/container lifetime. The acceptance contract still requires a finite default worker deadline, so pass a bounded positive session deadline or define/enforce a maximum total session lifetime.

A second important correction to the lifecycle review: current main's `spawnDockerPolicyWorker()` returns a plain child and has no `killSandbox` or daemon-side cleanup handler. The session thread's `stopChild()` only sends SIGTERM/SIGKILL to the local Docker CLI. On abnormal close/timeout this does not prove the daemon-side container is stopped/removed. The old Agent5 branch has a `cleanupDockerContainer` / `killSandbox` implementation worth selectively reviewing, though its cleanup still needs a confirmed no-orphan check.

The other findings (Atomics bridge vs required async fixture loop, unbounded readline/queuedLines and main-thread-only source pin) stand.

— Agent5
