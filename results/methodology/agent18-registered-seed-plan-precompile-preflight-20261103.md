# Compile-free registered Aichi seed-plan validation: rank26 natural-source campaign

**Agent18 | 3 November 2026 | implementation result; no qualified game.**

## Why this matters

The prospective natural-source rank26 24-pair/48-attempt campaign registered repeat indices 122–133, but the shared v3 hash-domain function only accepts repeat indices 0–99. The resulting [initial compiled CI attempt 41605520319](https://github.com/FlareZ123/experiment-01/actions/runs/41605520319) failed before a game was constructed. Agent47's **pre-observation registered erratum** adopted valid 20–31 IDs under the same 20261110/pilot/rank26 domain. This result prevents that class of error from needlessly consuming another Twinleaf compile and makes the exact selected physical seed identities inspectable before native dispatch. This does **not** convert a previously invalid attempt into a game.

## Reproducible implementation

- [Reusable pure validator](../../scripts/aichi-registered-seed-preflight.cjs) calls the repository's actual [v3 seed function](../../scripts/aichi-decorrelated-seeds.cjs) and rejects invalid identity ranges, duplicate repeats, repeated physical seeds, inconsistent registered physical-pair or native-attempt denominators, duplicate arm names, missing physical seats and absent physical-parity requirements. It returns explicit per-physical-pair seed identities and per-arm attempt identities, with a deterministic JSON manifest digest. No Twinleaf imports or game construction.
- [Explicit corrected source plan](../aichi-2026/registrations/agent47-rank26-natural-owner-seed-plan-v2.json) mirrors [Agent47's documented registration and erratum](../aichi-2026/registrations/agent47-rank26-natural-unownless-owner-24-paired-20261103.md): seed base 20261110, phase pilot, rank26, repeats 20–31, both physical slots, control/selected arms, expected 24 physical pairs and 48 native attempts. This JSON is a **machine-readable execution contract of the documented corrected campaign**, not an additional opportunity to choose seeds after outcomes.
- [Original rank26 natural runner](../../simulation/twinleaf/agent47-rank26-prospective-natural-owner-24.cjs) now imports this JSON through the validated pure module, replacing independently hard-coded BASE and REPEATS. Its result includes the manifest SHA256 and its denominators derive from the same preflight result. The decision hooks, candidate and source list, initial deals, RNG derivation, and native max-actions cap were not intentionally changed.
- Existing [manual-only Agent47 workflow](../../.github/workflows/agent47-actor-hand-discard.yml) now runs the seed-plan tests, exact full manifest preflight and natural-runner syntax check **after checkout and Node setup but before vendor submodule checkout, npm install or TypeScript compile**. No new workflow or automatic per-commit trigger was introduced.

## Evidence

Ten pure Node 22 regression cases passed locally and the registered plan produced exactly **24 unique nonzero physical-slot seed integers** and **48 configured arm identities**, with **12 slot A and 12 slot B**. The first negative test recreates rejected 122–133 indices before any engine import; others cover duplicate repeat, broken denominators, omitted seat, duplicate arms, injected seed collision, false parity waiver and rejection by the actual seed derivation. A separately invoked [GitHub Actions run 41608097983](https://github.com/FlareZ123/experiment-01/actions/runs/41608097983) was **successful** at commit 2928d428, with named precompile step **“Fail-fast registered original-source seed plan before native compilation”** successful and Twinleaf vendor/compile steps skipped.

The preflight does **not** run the 48 native attempts; it is a distinct stage with **zero games attempted and zero games certified**. Successful seed generation does not prove actual initial physical-deal parity: source and opponent setup, mulligans, compensation draws and card ordering still require archived actual Store fingerprints. Nor does it prove that any source action was selected, payable, settled or paper-valid. The original source 60, vendor/hook versions, policy strength, opponent response, clock and final gameplay outcomes require their own separate acceptance gates.

## Future integration

Use this pure validator as a shared typed seed-plan preflight for prospective two-seat campaigns. The actual game runners should import their immutable manifest instead of retyping constants, while their native attempts must still emit and compare source physical-deal fingerprints. Move the pattern into the common release dispatcher as agents retire redundant one-off workflows; keep historical registrations and error runs intact.

**Decision status remains:** 29 of 32 original Aichi paper lists authenticated, ranks 23/25/28 missing, zero competitively qualified games, no selected fixed 60, and no demonstrated 99.5% field win rate.
