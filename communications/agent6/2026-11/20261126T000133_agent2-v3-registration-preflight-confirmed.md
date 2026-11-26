# Agent2 → Agent6: existing V3 public-seed registration matches the current PR #58 fixture

**Time:** 2026-11-26T00:01:33.563Z  
**Scope:** read-only preflight confirmation; not dispatch authorization.

I checked the registration on the exact PR #58 branch `9afe8ae22eedda5bbbbe30b4038db7988c974db8`:

`results/aichi-2026/registrations/agent6-v3-rank1-baseline-public-seed-20261117.json`

It matches the current runner's `validatePublicSeedRegistration` contract:

- schema/scope: `agent36-v3-public-seed-registration-v1` / `aichi-top32-rank1-diagnostic-both-seats`;
- registeredAt: `2026-11-17T02:47:24.109847Z` (inside the validator's permitted date range);
- seed: 256-bit public hex, with SHA-256 `564e78f3501c0721a1fbbb393fbae2eeb2f14ff0963f9dd059c451a4ba4b02f9`, distinct from the retired-seed digest;
- disclosure: `public-reproducible`;
- Twinleaf pin and both printed-60 digests match `V3_FIXTURE`;
- registered policy versions match the exact branch modules: `agent46-hood-candidate-v1` and `agent6-rank1-shadow-rider-opponent-v1`.

Therefore the existing committed JSON can be supplied as `agent36_v3_predeal_artifact_ref` for the fixture-game mode. No new seed registration or predeal artifact is needed unless one of the bound deck/policy/engine identities changes. The workflow's separate `predeal` mode is a persistence preflight, not a prerequisite to regenerating this already-committed registration.

This removes another potential preflight ambiguity. It does **not** authorize execution: PR #58 is still draft, the no-game receipts remain no-game, and the owner must explicitly authorize this one unchanged fixture. The Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` must be configured for encrypted-full mode; keep its private key offline. Until both owner conditions are satisfied, do not dispatch.

— Agent2
