# V3 sanitized-only fixture gate: first execution attempt and narrow repairs

**Date:** 14 November 2026  
**Owner-dispatched run:** [43538393365](https://github.com/FlareZ123/experiment-01/actions/runs/43538393365)  
**Branch/head:** `agent2/v3-sanitized-diagnostic-20261114` / `3893c95be3539711172c2105fad96dd07c00a73b`  
**Scope:** execution-gate diagnosis only; not a gameplay or competitive result.

## Question

Can the first native V3 fixture proceed without the owner RSA public key while keeping full hidden-zone diagnostics out of public artifacts?

## Observed run

The workflow selected `sanitized-only` because `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM` was not configured. It then:

- checked out the pinned Twinleaf submodule;
- installed dependencies and compiled the pinned native server successfully;
- passed the V3 runner and fixture-runner syntax checks;
- ran 187 V3 contract tests: **185 passed, 2 failed**;
- skipped the native fixture-game step because the contract step failed.

The two failures were:

1. **Stale artifact assertion**, test 9 at `tests/2026-11/agent1-private-diagnostic-envelope.test.cjs:126`. It expected the historical condition `always() && inputs.agent36_v3_fixture_game`, while the new workflow correctly restricts the encryption step to `always() && inputs.agent36_v3_fixture_game && steps.diagnostic_recipient.outputs.mode == 'encrypted-full'`.
2. **Dynamic policy import**, test 22 at `tests/2026-11/agent36-v3-fixture-game.test.cjs:287`. The role closure audit found one dynamic require in `simulation/twinleaf/2026-11/agent49-owner-quick-ball-prompt-continuation.cjs`: `require(path.join(OUTPUT, name))`.

There was no native game, selected action, terminal state, or matchup result in this run. The artifact-upload step found no fixture files because the game step never ran.

## Privacy boundary assessment

The sanitized-only branch path is distinct from full-state diagnostics:

- `agent36-v3-runner.cjs` passes no `diagnosticSnapshot` callback and sets `requireFullStateDiagnostics:false`.
- In `agent49-native-fixture-game.cjs`, `captureDiagnostic` returns `null` when no callback is supplied. Thus the full-state before/after snapshots and final full-state snapshot are not captured in this mode.
- The runner sanitizes the in-memory fixture artifact before writing `fixture-game.sanitized.json` and `fixture-game.sanitized.txt`.
- The sanitizer drops actor-hand identities, hidden Prize membership identities, prompt-option identities, raw full-state objects, and policy-application receipts. It emits only allowlisted actor-observation/public-state summaries, prompt option counts, and a selected card printing after successful dispatch.
- The underlying `actor-observation-contract.cjs` emits a Prize `printing` only when `faceUpPrize === true`; face-down slots contain only their index. It emits `publicHand` only when `hand.isPublic === true`. The sanitizer drops `ownerK1.knownPrintings`, so preserved Prize/hand fields are already public rather than concealed identities.
- **Additional leak found before merge:** the native global `publicStateSnapshot()` records both players' Active/Bench names even in phases 0/1, and the first sanitizer preserved those strings. The actor-local observation also contains the acting player's own face-down setup Pokémon. The source contract explicitly says setup/waiting Pokémon are face-down and only occupied slot geometry may be revealed. Therefore the initial sanitized artifact was not yet safe to publish.
- [PR #51](https://github.com/FlareZ123/experiment-01/pull/51) now adds phase-aware redaction to both actor-observation and global public-state projections: in phases 0/1 it removes both players' Active/Bench identities while retaining occupancy geometry, and preserves identities only in public phases. It adds `setupPokemonIdentitiesEmitted:false` and regression coverage for both setup phases and both players. This patch has not yet been executed in CI.
- The output is explicitly marked `fixtureOnly`, `admissionEligible:false`, `competitiveGameQualified:false`, and `fullStateCaptured:false`. The workflow artifact paths include sanitized outputs and explicitly exclude raw `fixture-game.json` and `fixture-game.txt`.

The no-full-state mode is not a full-state key bypass, but **do not publish or rely on sanitized-only artifacts until PR #51's phase-aware redaction passes the existing V3 contract gate**. Full-state diagnostic mode still requires the owner-controlled RSA public key. Keep raw full-state traces out of public artifacts.

## Repairs committed on main

- **`0faf2c322bec50742adf7d2ac9f5efa409d28802`** — updated the legacy Agent1 artifact-path test to accept either the historical encryption guard or the stricter encrypted-full mode guard. Raw JSON/TXT exclusions remain asserted.
- **`f48680c9f9028d43708ad0ddae6dcc27ade0f79c`** — replaced the Quick Ball continuation's path-computed loader with three lazy literal requires under `vendor/twinleaf/`. A direct source check reports four require calls, four literal requires, and **zero dynamic require sites**. The injected-dependency test path remains lazy.
- **[PR #51](https://github.com/FlareZ123/experiment-01/pull/51), head `5a8d2f3e26d985006cf6c7a8dbbe93a5d3463445`** — also adds phase-aware setup Pokémon redaction and regression tests. The PR is clean/mergeable but remains open and its updated sanitizer tests are not CI-validated.

These fixes have not yet been validated by the branch's full V3 contract suite. [PR #51](https://github.com/FlareZ123/experiment-01/pull/51) is open and currently clean/mergeable against Agent2's active feature branch; it contains both fixes. Agent2 was informed to merge it, run the existing contract gate, and only then request another single fixture dispatch. Agent49 received the exact loader fix.

## Next gate

1. Review/merge PR #51 into `agent2/v3-sanitized-diagnostic-20261114`; it contains both main-branch contract fixes plus the phase-aware setup redaction.
2. Run the existing V3 contract gate; do not create another workflow or broaden the test suite. The setup-identity regression must pass before sanitized output is considered safe.
3. If the contract gate passes, execute one unchanged fixture game using the pinned candidate, rank-1 opponent, seed, engine revision, and policies.
4. Preserve only the phase-safe sanitized actor-only artifact unless the owner configures the public RSA key for encrypted full diagnostics.

A completed fixture would validate only that the current native execution path can complete and preserve its actor-only evidence. It would **not** qualify a paper matchup, establish opponent competence, select the final 60, or support any win-rate claim.
