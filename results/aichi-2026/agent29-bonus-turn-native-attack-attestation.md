# Bonus-turn root attestation: grant must originate in an attack

**Agent 29, 20 October 2026.** Evidence class: code-path audit, adversarial deterministic unit tests, and successful manually dispatched GitHub Actions. This finding changes only a source-root **evidence validator**, not the decision policy, card mechanics, or simulated games.

## Qualification gap and counterexample

The registered bilateral v2 gate permits a candidate extra turn before the source's return only with separately reported Timeless-GX grant, completion and subsequent-own-turn ordinals. The root-level attestor in `simulation/evaluation/bilateral-v2-root-ledger-attestation.cjs` previously checked that those indices belonged to the candidate, had plausible game-turn numbers, and followed one another.

The attestor did not check the **action class of the alleged extra-turn granting root**. A coherent candidate-on-turn-2 `PlayCardAction` or `PassTurnAction` could be relabeled as the source of a claimed Timeless-GX turn without violating those ordinal/actor constraints. Thus, an asserted `candidateBonusTurn` could receive `bonusTurnRootChain: true` and `rootClaimsAuthenticated: true` with no demonstrated attack at the purported grant root. This is an evidence spoofing possibility in synthetic or malformed producer records; it is not an observed forged historical campaign artifact.

## Implemented boundary

The read-only attestor now requires:

```js
const grantIsAttack=Number.isSafeInteger(bonus?.grantRootActionOrdinal)&&
  ledger[bonus.grantRootActionOrdinal]?.action==='AttackAction';
```

The existing `bonusTurnRootChain` condition incorporates `grantIsAttack`. Ordinal, actor, turn, provenance and subsequent-turn checks remain intact. Ordinary multi-step attack prompts still need their own causal effect evidence and are not certified by this new type check.

Added adversarial cases to the existing `an extra candidate turn needs its own native grant and next-turn roots` test. Keeping every root ordinal and actor fixed, the test substitutes `PlayCardAction`, `PassTurnAction` or `ResolvePromptAction` for the granting native attack, expecting rejection. It separately points the claimed grant at an existing candidate-owned Trainer root, expecting rejection. The original authentic-action-shaped positive control remains accepted.

## Verification

- Code patch: [741acf7](https://github.com/FlareZ123/experiment-01/commit/741acf7f5762547dbdeba140a2b218917236eda3)
- Adversarial tests: [b6c65f6](https://github.com/FlareZ123/experiment-01/commit/b6c65f643a90cd9d76460003e2c1e3e696f2c216)
- Existing manually dispatched CI now includes the root-ledger suite: [f79f3bd](https://github.com/FlareZ123/experiment-01/commit/f79f3bdeb74279160aaece4c8a5faa2e29152b85)
- [Manual benchmark CI 39371546898 succeeded](https://github.com/FlareZ123/experiment-01/actions/runs/39371546898) at head `4b3e2ba45588c9c4684d940d5947d2564d20038e`. Remote readback of that exact commit verified the patch, negative tests and workflow inclusion.

The test itself uses a six/seven-root synthetic action ledger, with **no simulated competitive game**, no random seed and no source opponent deck. It proves that this evidence checker rejects a particular unsupported extra-turn origin.

## Residual limits and integration

The root attestor still does not prove the `AttackAction` actually chose **Timeless-GX**, resolved its extra-turn effect, or preserved original source-state equivalence. These require source-native settled attack evidence and a causally linked candidate next own turn. Other pressure/reply validity and policy information-set gates remain independent. The current root-claim result is one validation ingredient, not a paper-rule qualification or a win.

Agent 41's canonical bilateral runner and Agent 33's evidence qualification should retain this guard without changing source-vs-candidate deck identities, existing starts or opponent response policies. The positive synthetic fixture must never be counted as an Aichi Top 32 success.

**Current external project status unchanged:** 29/32 exact source 60s recovered; ranks 23, 25 and 28 unavailable; zero competitively qualified games; no demonstrated 99.5% single-deck result.

## Follow-up: native completion lineage

A second code review exposed another forgery channel. Once the granting root had the correct `AttackAction` class, the prior attestor could still treat an arbitrary later candidate-owned root on the same turn as the attack's `completionOrdinal`. That would incorrectly conflate attack declaration with resolved effect.

The [follow-up patch d3b55d9](https://github.com/FlareZ123/experiment-01/commit/d3b55d91135b633111bca255bb8c460a646a9ad6) now requires completion at the **same actual granting attack root**, or at a genuine `ResolvePromptAction` whose Store-provided `initiatingRootActionOrdinal` is the granting attack root. It accepts unowned/defender-owned native prompt closures when this origin matches. Other completion action types or mismatched origins fail closed.

The [new regression test a0e2b4a](https://github.com/FlareZ123/experiment-01/commit/a0e2b4a49bb38ee961c3d13d958112c085586bbe) checks a valid unowned prompt closure, a defender-owned closure with correct initiating root, and rejected mismatched-origin or unrelated-`PlayCardAction` completions. The **second manual [benchmark CI 39372125149](https://github.com/FlareZ123/experiment-01/actions/runs/39372125149) passed** at precisely `a0e2b4a49bb38ee961c3d13d958112c085586bbe`.

These are conservative action-provenance predicates. Timeless-GX selection, copied-attack effect, causation of the extra turn and game-strength claims still require independent Store evidence.


## 21 October continuation: authenticate the named direct attack

The preceding Action-class safeguard still permitted a native **ordinary attack**, such as a source-available `Claw of Darkness`, to masquerade as a Timeless-GX grant if caller-supplied turn/ordinal labels were otherwise consistent. An `AttackAction` proves an attack attempt, not the claimed **kind** of attack. This is again a synthetic trace-integrity counterexample, not an observed dishonest native game.

The pinned headless producer already records the actual native attack name as `rootActionLedger[].attack` from `AttackAction.name`; no new telemetry or simulator patch was needed. The attestor now requires `action === 'AttackAction'` **and** `attack === 'Timeless-GX'` for a **direct printed** extra-turn-grant origin. Existing source/seat/turn/causal prompt checks remain intact. A synthetic attack named `Claw of Darkness` is rejected with all ordinal and turn fields unchanged; the direct Timeless-GX-shaped positive case remains accepted.

- Validator commit [c5f1b5e](https://github.com/FlareZ123/experiment-01/commit/c5f1b5ef63f633fee19eb6ddc40997ac5f67378b).
- Regression commit [d22a174](https://github.com/FlareZ123/experiment-01/commit/d22a174a7c266abff19a3ac39c667fec6c4a05c2).
- [Manual benchmark run 39536329383](https://github.com/FlareZ123/experiment-01/actions/runs/39536329383) **passed** on source-inclusive checkout `b7a7cd9b7b1749bd0b05874e79d87b23a3eb352d`; commit comparison confirms the validator/test commits are its ancestors.

**Fail-closed limitation:** genuine copied Timeless-GX through Apex Dragon, Perfection or Copycat may have another root action/name. This strict direct-name attestor will **not** authenticate those paths without separate copied-attack declaration/effect evidence, even if they grant an extra turn. Its result still does not certify resolution of Timeless-GX, an actual extra turn caused by it, or any competent match outcome. For joint policy work, validate a direct attack first, then add explicit native effect evidence rather than relaxing the name check.

Benchmark status stays **29/32 exact attributed sources, zero qualified games, no verified 99.5% fixed 60**.
