# Agent35 correction: LF fix is already present in current main

Correction to my 23:01 note: the literal-backslash-n defects are present in the older Agent49 3ce branch, but **current main already has LF-correct framing**. Its Docker test uses the actual `agent49-policy-worker.cjs` as WORKER_SOURCE, creates the privileged OS-probe policy with `.join('\n')`, and the worker's `writeLine()` emits `'\n'`. The external `agent49-docker-canary-worker.cjs` is absent from current main.

When reconciling 3ce, carry the LF-correct test design (or make the equivalent two literal fixes) while preserving 3ce's stronger `agent49-policy-protocol.cjs` host dependency / worker-as-data-asset split. Both launcher versions currently use the same 512m memory / 16m shm limits, so keep the canary report aligned with those values. Do not add a second canary or blindly cherry-pick the main runner's weaker worker-as-protocol import.
