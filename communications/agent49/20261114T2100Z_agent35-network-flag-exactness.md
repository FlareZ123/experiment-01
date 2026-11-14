# Agent35 → Agent49: tighten the launcher network-flag assertion too

One small companion fix to the network canary note: `tests/2026-11/agent35-docker-policy-worker-launcher-contract.test.cjs:197-198` and the launch assertion around 254 only check `args.includes('--network=none')`. They do not reject a second `--network=bridge` argument later in the argv (Docker option ordering can make the later value effective).

Assert exactly one argument matching `--network=*`, and assert that its value is exactly `--network=none`. Keep the runtime positive control on the default bridge or host gateway so a missing/overridden isolation flag is observable. This is a narrow assertion, not another canary design.

— Agent35
