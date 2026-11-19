# Rank 31 Dusknoir / Chimecho opponent policy v1 — synthetic prototype

**Agent35 · 19 November 2026 · fixed source rank 31 · no game execution**

## Deliverable

- Policy: `simulation/evaluation/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy.cjs`
- Tests: `tests/2026-11/agent35-rank31-dusknoir-chimecho-opponent-policy.test.cjs`
- Challenge suite: `results/aichi-2026/2026-11/agent35-rank31-opponent-policy-challenge-suite-v2.json`
- Dependency manifest: `simulation/evaluation/2026-11/agent35-rank31-dependency-manifest-v1.json`
- Common constraints: `simulation/evaluation/2026-11/agent35-rank31-common-constraints-v1.json`

The policy is bound to the exact rank-31 entry in `results/aichi-2026/full-decklists.json` (**Yuhi Yokoyama**, 60 cards; canonical SHA-256 `36b077c17263471d3a2161f9cfcd352d9de7b9cfad6eeb8ad60310c32b5845c8`) and the fixed Hood Shadow Rider candidate (canonical SHA-256 `1880c60b44761c0cf22eb3e5cfa43e6e5581c174dc737932c19728cc5da5a1e4`). The engine pin is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` at `vendor/twinleaf`; no upstream code or shared runner/projection was changed.

## Material card-text correction

The rank-31 list contains **3 Dusclops PRE 36**, **3 Dusknoir PRE 37**, **1 Dusknoir BCR 63**, and **1 Radiant Alakazam SIT 59**. The bundled English card pool `resources/cards/en/sv8pt5.json` lists Cursed Blast on both PRE printings:

- **Dusclops PRE 36:** 5 damage counters on one opposing Pokémon, then this Dusclops is Knocked Out.
- **Dusknoir PRE 37:** 13 damage counters on one opposing Pokémon, then this Dusknoir is Knocked Out.

Agent44's earlier rank-31 counterline report documents Dusknoir PRE 37, Dusknoir BCR 63 and Radiant Alakazam SIT 59, but does not account for the three Dusclops PRE 36 copies. Rank31 therefore has two source-specific Cursed Blast producers in addition to the two MoveDamage producers. The Dusclops fact is card-pool-text verified, and its class mapping/prompt/effect contract are now confirmed by direct inspection of the pinned Twinleaf source. Native Store receipt and runtime effect execution remain untested.

## Pinned Twinleaf source inspection

The pinned revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` confirms the previously missing Dusclops implementation:

- `ptcg-server/src/sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts.ts` lines 128–137 maps `DusclopsPRE` to the Shrouded Fable `Dusclops` class with PRE number 36; it maps `DusknoirPRE` to the corresponding Dusknoir class with PRE number 37.
- `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/dusclops.ts` lines 27–77 declares Cursed Blast with `knocksOutSelf: true`, opens a `ChoosePokemonPrompt` for the opponent's Active/Bench with min 1, max 1 and no cancel, applies `PlaceDamageCountersEffect(50)`, then self-KOs even if the counters were prevented (the source comment names Stealthy Hood).
- `ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/dusknoir.ts` lines 19–65 implements the same prompt/self-KO structure with `PlaceDamageCountersEffect(130)`.

This is pinned-source implementation evidence, not a native Store receipt or executed game. The new synthetic Dusclops prompt test validates the policy's 50-counter branch through the shared request/decision validators.

## Implemented policy behavior

1. Distinguishes Dusclops PRE 36 (50 damage) from Dusknoir PRE 37 (130 damage) and only activates either Cursed Blast when an unprotected 2+ Prize target can be Knocked Out. The prompt selector avoids visible Stealthy Hood targets.
2. Handles the reported Field Blower SelectOptionPrompt / ChoosePokemonPrompt shape. It prefers the two-Tool branch when two Hoods are present and selects opponent Pokémon carrying the highest-priority visible Tools. Option-label interpretation is heuristic and only synthetic-tested.
3. Uses Roxie selection to prioritize Koffing and excludes rule-box Pokémon.
4. Prefers Chimecho's Bell of Silence against a visible Ability-bearing board.
5. Never infers Poltergeist damage from a hidden opponent hand.
6. Explicitly abstains on MoveDamagePrompt. Dusknoir BCR Sinister Hand and Radiant Alakazam Painful Spoons are not used because the shared prompt projection does not expose that family.

## Validation

**15/15 synthetic tests passed**, using the actual repository Agent49 `validateRequest` and `validateDecision` functions. The test source was evaluated in a local V8 isolate with `node:test` and `node:assert/strict` shims. **17 actor-view fixtures** were digested. Both physical seats were covered by synthetic prompt tests. Repeated identical input produced identical validated output.

This establishes only deterministic policy/validator behavior on authored synthetic fixtures. It does not establish native effect resolution, full-deck policy competence, or competitive strength.

## Hard limitations

- Zero native Twinleaf games, native Store receipts, source-natural cases, worker IPC handshakes, or timeout measurements.
- Field Blower's exact pinned-source option labels and full effect chain have not been exercised.
- Dusclops PRE 36's pinned-source mapping and prompt contract are verified; native Store receipt/runtime effect remains unverified.
- MoveDamagePrompt remains unsupported; Sinister Hand and Painful Spoons remain blocked.
- Root priorities and prize-trade thresholds are heuristics, not calibrated strategy.
- No rank31 matchup result, no Top 32 aggregate, no win-rate estimate, and no 99.5% claim.

## Next evidence required

1. Obtain source-natural native prompt/effect receipts for both Cursed Blast producers and Field Blower, without changing the frozen candidate or first-game diagnostic.
2. Keep Sinister Hand and Painful Spoons disabled until the shared prompt boundary can represent MoveDamage safely; do not create a second runner or validator.
3. Add native tests for both physical seats, exact option labels, Hood prevention, and source self-KO.
4. Expand the full 60-card policy only after the native prompt boundary is understood. Keep all held-out cases unrun and do not tune against them.

## Evidence classification

- **Card-pool text:** Dusclops PRE 36 and Dusknoir PRE 37 Cursed Blast effects.
- **Repository source analysis:** exact rank31 list, candidate fingerprint, pinned Twinleaf path/revision, shared worker validators and prompt projection.
- **Synthetic computation:** 15/15 deterministic validator tests.
- **Not demonstrated:** native effect behavior for this policy, any games, matchup win rate, or the 99.5% objective.
