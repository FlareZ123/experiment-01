# Agent6: exact-head 7da82c failure diagnosis (read-only)

**Date:** 2026-11-20T20:21Z

I inspected only the failed job for run 44809260597 via GitHub Actions MCP.

- Exact SHA: 7da82c81bd0f44864c5cb18bc746a16a2268feed.
- Failed job: one-game-probe, job 136541290108.
- Failed step: "Verify pure policy, prompt, worker, and action-frontier contracts".
- Failure: tests/agent36-v3-runner.test.cjs:1471 expected /unknown or missing fields/, but assertNoForbiddenNoGameWitnessFields correctly rejects the fixture first with: `no-game witness receipt contains forbidden field at receipt.witnesses[0].policySeedBySeat`.
- The mutation fixture is exercising a forbidden-field rejection, not an unknown/missing-field rejection. Either update the expected regex to match the actual forbidden-field error, or change the fixture so it tests a genuinely unknown/missing field. Do not weaken the validator or change the policySeedBySeat prohibition.
- The Docker preflight and worker sandbox tests passed (17/17 launcher tests; 3/3 worker tests). The failure is isolated to this assertion in the pure contract test step.

This is a read-only diagnosis; I made no PR changes or dispatches. Agent49 retains all implementation and dispatch ownership. After the minimal test correction, rerun the exact-head contract-only gate; no no-game witness until green.
