# Agent44: M4 headless integration audit

**Date:** 7 November 2026  
**Status:** integration seam verified in research-owned headless runner; not yet selected by the shared bilateral policy  
**Scope:** paper-rule correction for Special Red Card M4, as present in original Aichi source ranks 5 and 26

## Question

Does the current headless Twinleaf adapter already provide a supported way to apply the two M4 paper corrections to actual native games, and is the shared v8 policy using it?

## Finding

The research-owned `simulation/twinleaf/headless.cjs` already exposes both corrections as opt-in `runMatch` request flags. A new adapter or vendor edit is unnecessary.

### CRI 82 source annotation and pinned engine identity

The rank5/rank26 source inventories annotate this card as English representative `CRI 82`; the chronology crosswalk maps it to the pre-event Japanese counterpart `M4 072/083`. The repository card pool confirms that `resources/sets/en.json` maps set ID `me4` to **Chaos Rising**, `ptcgoCode: "CRI"`, released **22 May 2026**. `resources/cards/en/me4.json` contains `me4-82` (and alternate-art `me4-113`), both named **Special Red Card** with the Prize-limit, shuffled-hand-to-deck-bottom and draw-three effect. The later English CRI printing remains a representative annotation; do not imply it was physically available at the 10 May event.

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

This is the actual root Store dispatch path. The random draws are not consumed by speculative bot clones. The returned manifest identifies the protocol as `exact-M4-opponent-hand-fisher-yates-real-store-physical-prng-v1`.

Both flags should be enabled together for a shared-policy treatment. Preselection prevents the policy from selecting a publicly illegal M4 play; the Store correction enforces the paper rule and correct physical hand shuffle at execution.

## Additional open question: speculative bot evaluation

The above correction establishes the **actual** M4 Store effect and its physical shuffle. One separate policy-fidelity question remains unresolved. In `headless.cjs`, the actual selected action is passed through `dispatchSpecialRedCardPaperRoot`, but `withM4PaperOwnerRoot` currently installs only the empty-hand veto during owner-root `decodeNextAction`; for a legal positive-hand M4, it does not install the random hand permutation in the chooser's speculative evaluation.

The same headless adapter documents that upstream tactics simulate candidate actions, including random prompts, before dispatching the real action, and uses `SimpleTacticsAi.decodeNextAction` for owner choices. It has not yet been established whether the pinned Simulator executes M4's `reduceEffect` in those speculative clones or whether the deterministic unshuffled hand order can affect its evaluation. This is an **open question, not a demonstrated gameplay defect**.

Before claiming that the complete M4 policy decision path is paper-faithful, inspect the pinned local bot/simulator implementation or add an instrumented native test. If the clone does execute M4's effect, its hand-only shuffle should use the actor's **policy/decision RNG**, while the actual Store continues to use the affected opponent hand owner's **physical RNG**. A regression should prove that clone randomization does not mutate the real root hand or consume the physical stream. See the direct [steward handoff](../../communications/agent36/20261107T093830Z_agent44_m4-speculative-shuffle-question.md).

## Current shared-policy status

`simulation/evaluation/agent36-issue25-common-v8.cjs` does not set either flag. Its registered profile currently names source ranks 6, 11, 1 and 3, with two candidate 60s. It does not register the M4-bearing rank-5 or rank-26 original lists, so v8 has not tested this correction. This is an integration opportunity for a future registration, not evidence that the historical v8 results were mislabeled.

Keep v8 and all existing receipts immutable. Add the two flags only to a new preregistered shared-policy version that explicitly registers the M4 source lists.

## Existing evidence

- `simulation/twinleaf/agent44-special-red-card-empty-hand-hook.cjs`: reversible real-Store empty-hand and hand-shuffle correction.
- `simulation/twinleaf/agent44-m4-owner-root-preselection.cjs`: versioned owner-root negative paper guard.
- `simulation/evaluation/agent44-m4-public-prerequisite.cjs`: public-only negative prerequisite certificate.
- `tests/agent44-m4-public-prerequisite.test.cjs`: 60 crossed cases over two seats, two card-name aliases, five Prize counts and three opponent-hand counts.
- `tests/agent44-specialredcard-emptyhand-native.sft.cjs`: both physical seats; zero-hand rejection; legal positive-hand play; Prize limit; native hand-order baseline; actual hand-only Fisher-Yates permutation; low-deck redraw difference; all six three-card permutations under seeded physical RNG; strict hook restoration.
- The four-arm source census configuration is embedded as the frozen `REGISTRATION` object at the top of `simulation/evaluation/agent44-m4-original-two-source-census.cjs`; there is no separate JSON under `results/aichi-2026/registrations/`. It names ranks 5/26, rank1 as the fixed opponent, physical source seats 0/1, seed base 20261107, phase `pilot`, repeat 2, and a 110-action cap. The corresponding result write-up is `results/rules/agent44-original-m4-source-owner-root-four-arm-20261107.md`.
- Existing dedicated smoke run [42330894185](https://github.com/FlareZ123/experiment-01/actions/runs/42330894185) passed 37/37 native and paper tests plus a no-M4 game control.

The pinned Twinleaf card implementation identifies the Japanese source as `Special Red Card M4` and prints the effect: the opponent shuffles their hand and puts it on the bottom of their deck; if any cards were placed there, the player draws three. The hook's hand-only permutation is the relevant shuffle because the printed effect places that shuffled hand at the deck bottom.

## Required release validation

For a new shared-policy registration:

1. Include both `specialRedCardPaperPreselection` and `specialRedCardPaperCorrection` in every applicable `runMatch` request.
2. Include the three hook modules, the public prerequisite module, the relevant tests, the headless adapter and the policy entrypoint in the manifest's hash closure.
3. Register the exact original rank-5 and rank-26 60-card lists, both physical seats, and explicit no-M4 controls.
4. Preserve seed, policy, repository revision, Twinleaf pin, shuffle protocol, root action ledger, paper replay and all failure receipts.
5. Require successful real Store dispatch and paper-rule replay before counting a game as qualified.

## Limitations

These tests establish the isolated M4 correction and the headless integration seam. They do not establish a completed natural game with either original source 60, overall policy competence, a matchup win rate, or the 99.5% objective. Competitive games qualified remain zero.
