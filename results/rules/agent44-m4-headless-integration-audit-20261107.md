# Agent44: M4 headless integration audit

**Date:** 7 November 2026  
**Status:** integration seam verified in research-owned headless runner; not yet selected by the shared bilateral policy  
**Scope:** paper-rule correction for Special Red Card M4, as present in original Aichi source ranks 5 and 26

## Question

Does the current headless Twinleaf adapter already provide a supported way to apply the two M4 paper corrections to actual native games, and is the shared v8 policy using it?

## Finding

The research-owned `simulation/twinleaf/headless.cjs` already exposes both corrections as opt-in `runMatch` request flags. A new adapter or vendor edit is unnecessary.

### CRI 82 source annotation and pinned engine identity

The rank5/rank26 source inventories annotate this card as English representative `CRI 82`; the chronology crosswalk maps it to the pre-event Japanese counterpart `M4 072/083`. The repository card pool confirms that `resources/sets/en.json` maps set ID `me4` to **Chaos Rising**, `ptcgoCode: "CRI"`, released **22 May 2026**. `resources/cards/en/me4.json` contains `me4-82` (and alternate-art `me4-113`), both named **Special Red Card**, both explicitly marked `expanded: Legal`, with the Prize-limit, shuffled-hand-to-deck-bottom and draw-three effect. The later English CRI printing remains a representative annotation; do not imply it was physically available at the 10 May event.

The pinned native fixture already resolves the CRI 82 engine object and asserts:
`name === "Special Red Card"`, `fullName === "Special Red Card M4"`, `set === "CRI"`, and `setNumber === "82"`. See `tests/agent44-specialredcard-emptyhand-native.sft.cjs`. The same native object is used by the both-seat zero-hand, positive-hand and seeded hand-shuffle fixtures. Therefore the Store dispatch guard's `card.fullName === "Special Red Card M4"` **does match the actual CRI 82 engine object**; the existing staged tests already exercise that exact CRI 82 physical identity. No second CRI-named class or additional fullName branch is needed for this source printing. The source chronology mapping remains separate from engine identity.

### 1. Owner-root preselection

Set:

```js
specialRedCardPaperPreselection: true
```

The runner creates `m4OwnerRootPaperAudits` and, at each genuine non-prompt `PLAYER_TURN` root, wraps the active actor's real `decodeNextAction(state)` call with:

```js
withM4PaperOwnerRoot(state, state.activePlayer, selectRoot, auditCallback)
```

The hook uses the actor-root public observation, including the opponent's public hand count and Prize count. It does not inspect concealed opponent card identities. The returned match manifest records `specialRedCardPaperPreselectionVersion: agent44-m4-owner-root-preselection-v1` and the resulting audit rows.

### 2. Actual Store effect correction

Set:

```js
specialRedCardPaperCorrection: true
```

The runner routes the selected action from the actual match Store through `dispatchSpecialRedCardPaperRoot`. Non-M4 actions pass through the original dispatch path. For M4, the hook enforces the empty-opponent-hand prohibition and randomizes the opponent's hand before Twinleaf's original reducer places it on the deck bottom.

The runner supplies the physical random source by selecting the stream belonging to the affected opponent hand owner:

```js
choosePhysicalShuffleRandom(
  random,
  physicalShuffleRandomBySeat,
  affectedSeat,
  current.turn,
  isolateShuffleAfterSetup
)
```

This is the actual root Store dispatch path. The **physical RNG draws** are not consumed by speculative bot clones. The returned manifest identifies the protocol as `exact-M4-opponent-hand-fisher-yates-real-store-physical-prng-v1`.

Because M4 is playable only when the opponent has at most three Prizes, an actual M4 shuffle cannot occur during turn-0 setup. Under `isolatePhysicalShuffleRandomnessAfterSetup:true`, its actual shuffle therefore uses the affected opponent hand owner's per-seat physical stream. That flag still keeps turn-0 setup deck shuffles and coin flips on the shared stream; it only isolates turn-1-and-later deck-search shuffles. Full `isolatePhysicalShuffleRandomness:true` is the distinct mode that isolates setup shuffles too. See the [four-arm source-census RNG limitation](agent44-original-m4-source-owner-root-four-arm-20261107.md).

Both flags should be enabled together for a shared-policy treatment. Preselection prevents the policy from selecting a publicly illegal M4 play; the Store correction enforces the paper rule and correct physical hand shuffle at execution.

## 3. Speculative clone shuffle (new opt-in)

A third default-off flag, `specialRedCardPaperSpeculativeShuffle:true`, now optionally installs the full M4 paper hook around the owner-root chooser. It requires both existing M4 flags, `isolatePolicyRandomness:true`, and either `isolatePhysicalShuffleRandomness:true` or `isolatePhysicalShuffleRandomnessAfterSetup:true`.

The wrapper passes the active seat's `policyRandomBySeat` callback to the hook. If the pinned Simulator executes M4 `reduceEffect` inside a speculative clone, the clone's hand permutation therefore consumes only the actor's policy RNG. The hook is restored before the selected action reaches the real Store, which continues to use the affected hand owner's per-seat physical RNG. The manifest records `exact-M4-opponent-hand-fisher-yates-policy-clone-prng-v1` and preselection version `agent44-m4-owner-root-preselection-v2-policy-rng-clone-shuffle`. Existing registrations are unchanged when this third flag is absent.

Native adapter coverage is in `tests/agent44-m4-owner-root-preselection.native.test.cjs`: both physical seats dispatch M4 in a separate staged clone, assert the expected policy-RNG permutation and unchanged real root, then dispatch the actual root Store action and assert that only the physical RNG is consumed. `tests/agent44-specialredcard-headless-run-option.test.cjs` checks required flags and a bilateral no-M4 inertness control. The native test was added to step 39 of `.github/workflows/twinleaf-smoke.yml`.

The first smoke run [42362189659](https://github.com/FlareZ123/experiment-01/actions/runs/42362189659) **failed step 39** in the new native test for both seats. The failure was an assertion against the stale `clone.opponent` object reference after Twinleaf's immutable Store dispatch; the actual state is replaced at `clone.store.state`. The test now reads the current Store state after dispatch. The failure does not establish that the shuffle hook is wrong, because the stale-reference assertion stopped the test before the remaining checks. The no-card bilateral control was not yet qualified by this run. The run was on commit `21fb1608892dc8ef3f63777bb5a3819e0995a7ce`, before the final per-seat physical RNG validation. Rerun the corrected tests against the latest main head; do not call the protocol CI-validated yet.

## Additional open question: speculative bot evaluation

The adapter now supports a paper-correct speculative M4 effect if the pinned Simulator executes it. The staged clone test proves the adapter mechanism, but does **not** establish that the pinned `SimpleTacticsAi` actually executes M4 `reduceEffect` inside speculative clones. That bot call path remains unverified; this is an **open question, not a demonstrated gameplay defect**.

Before claiming complete M4 policy-evaluation fidelity, inspect the pinned local bot/simulator implementation or add an instrumented `SimpleTacticsAi` diagnostic. If the clone does execute M4's effect, the new flag supplies the actor's policy RNG while the real Store continues to use the affected opponent hand owner's physical RNG. See the direct [steward handoff](../../communications/agent36/20261107T093830Z_agent44_m4-speculative-shuffle-question.md).

## Current shared-policy status

`simulation/evaluation/agent36-issue25-common-v8.cjs` does not set either original flag. The current v9 VIP A/B/A registration is limited to source ranks 6 and 11 and also does not set the M4 flags. Neither version tests the M4-bearing rank-5 or rank-26 original lists, so neither historical result is reinterpreted.

Keep v8/v9 and all existing receipts immutable. Any future M4 cohort must be a new preregistered version that registers the M4 source lists and, if speculative clone shuffle is enabled, sets all three M4 flags plus both RNG isolation domains required by the third flag.

## Existing evidence

- `simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs`: reversible real-Store empty-hand and hand-shuffle correction.
- `simulation/twinleaf/agent44-m4-owner-root-preselection.cjs`: versioned owner-root negative paper guard.
- `simulation/evaluation/agent44-m4-public-prerequisite.cjs`: public-only negative prerequisite certificate.
- `tests/agent44-m4-public-prerequisite.test.cjs`: 60 crossed cases over two seats, two card-name aliases, five Prize counts and three opponent-hand counts.
- `tests/agent44-specialredcard-emptyhand-native.sft.cjs`: both physical seats; zero-hand rejection; legal positive-hand play; Prize limit; native hand-order baseline; actual hand-only Fisher-Yates permutation; low-deck redraw difference; all six three-card permutations under seeded physical RNG; strict hook restoration.
- `tests/agent44-m4-owner-root-preselection.native.test.cjs`: staged clone/real-Store policy-versus-physical RNG split in both seats; root immutability during clone evaluation.
- `tests/agent44-specialredcard-headless-run-option.test.cjs`: default-off behavior, required flag/RNG validation, and bilateral no-M4 inertness control.
- The four-arm source census configuration is embedded as the frozen `REGISTRATION` object at the top of `simulation/evaluation/agent44-m4-original-two-source-census.cjs`; there is no separate JSON under `results/aichi-2026/registrations/`. It names ranks 5/26, rank1 as the fixed opponent, physical source seats 0/1, seed base 20261107, phase `pilot`, repeat 2, and a 110-action cap. The corresponding result write-up is `results/rules/agent44-original-m4-source-owner-root-four-arm-20261107.md`.
- Existing dedicated smoke run [42330894185](https://github.com/FlareZ123/experiment-01/actions/runs/42330894185) passed 37/37 native and paper tests plus a no-M4 game control.

The pinned Twinleaf card implementation identifies the Japanese source as `Special Red Card M4` and prints the effect: the opponent shuffles their hand and puts it on the bottom of their deck; if any cards were placed there, the player draws three. The hook's hand-only permutation is the relevant shuffle because the printed effect places that shuffled hand at the deck bottom.

## Required release validation

For a new shared-policy registration:

1. Include both `specialRedCardPaperPreselection` and `specialRedCardPaperCorrection` in every applicable `runMatch` request. If speculative clone shuffling is required, also set `specialRedCardPaperSpeculativeShuffle:true`, `isolatePolicyRandomness:true`, and one per-seat physical shuffle isolation mode.
2. Include the three hook modules, the public prerequisite module, the relevant tests, the headless adapter and the policy entrypoint in the manifest's hash closure.
3. Register the exact original rank-5 and rank-26 60-card lists, both physical seats, and explicit no-M4 controls.
4. Preserve seed, policy, repository revision, Twinleaf pin, shuffle protocol, root action ledger, paper replay and all failure receipts.
5. Require successful real Store dispatch and paper-rule replay before counting a game as qualified.

## Limitations

These tests establish the isolated M4 correction and the headless integration seam. They do not establish a completed natural game with either original source 60, overall policy competence, a matchup win rate, or the 99.5% objective. Competitive games qualified remain zero.
