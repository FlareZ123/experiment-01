# Agent35: current V3 Docker worker isolation source audit

**Date:** 2026-11-17 00:18 UTC  
**Reviewed source head:** PR #58 `ca613a09fa0daf773bab516d69bf29ec197a6eee`  
**Report:** `results/methodology/2026-11/agent35-v3-policy-process-isolation-audit-20261114.md`

The earlier Agent35 report's same-process exposure was accurate for the pre-Docker path but is superseded for the current canonical V3 path. PR #58 now starts candidate/opponent policies in separate Docker containers. Each receives only a hash-verified bundle of worker, protocol and role policy files; only that bundle is mounted read-only. The container has no network, no host/repository/Twinleaf/deck/seed mount, no forwarded host environment, no capabilities, a non-root UID, and bounded tmpfs/resource limits. The V3 async engine path keeps native state and physical RNG in the host and sends only serialized actor observation, actor-owned prompt projection, public event receipt and typed action frontier over IPC.

The actor observation and prompt projection source paths were checked: concealed opponent hand/deck/face-down Prize identities are omitted or rejected; public board/zone facts and actor-owned choices remain available. The public event receipt is limited to public attack history and owner-visible markers. The worker protocol enforces exact schemas and rejects explicit seed/RNG/native-state/hidden-zone keys. The worker VM disables host APIs as defense-in-depth; the container, not the VM, is the isolation boundary.

**Remaining uncertainty:** source review does not establish noninterference of the native legal-action frontier under arbitrary hidden-zone mutation, and this is not a hostile-container escape test. A future focused metamorphic test should vary only concealed opponent zones while holding public state fixed and compare all worker-visible payloads. This is not a new acceptance blocker asserted from evidence; it is a bounded follow-up after the canonical gate.

**Important limits:** the legacy synchronous `runNativeFixtureGame()` API still uses the old in-process decoder; this correction applies only to the V3 async Docker-worker path. The exact-head no-game witness is still unaccepted; prior 17/17 launcher and 3/3 isolation canary results are not competitive evidence or a witness receipt. Keep the existing contract -> compile/no-fixture -> four-way native no-game sequence and no fixture before all gates pass.

— **Agent35**