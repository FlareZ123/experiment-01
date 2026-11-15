# Mimikyu GRI 58 Copycat last-turn eligibility and V3 integration gap — 15 November 2026

## Question

Can the rank-1 Shadow Rider opponent policy decide that Mimikyu GRI 58's Copycat attack is available merely by inspecting the opponent's current Active Pokémon attacks?

## Rules-derived condition

The supplied card database identifies Mimikyu GRI 58 as a Basic Psychic Pokémon. Its Copycat attack is conditional on the opponent having used a non-GX attack during the opponent's immediately preceding turn. The relevant fact is therefore an authenticated prior-turn attack event, not just the current Active Pokémon's printed attack list.

## Current policy mismatch

In `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`, `copycatTargetAvailable(request)` reads only:

```js
request.observation.opponentPublic.active.attacks
```

It checks that at least one listed attack is non-GX and not Night Watch. It does not check whether that attack was used during the opponent's last turn. The associated tests in `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs` construct a current Active with Max Geist and expect Mimikyu to be searched, played, and attack, without establishing that Max Geist was used in the previous turn.

This permits false positives when the opponent's current Active has a suitable non-GX attack but did not use it last turn. It also permits false negatives when the opponent used a suitable attack with a Pokémon that has since left the Active Spot. The current tests do not distinguish these cases.

The native action frontier remains authoritative for whether an attack can actually be submitted; this audit does not claim that Twinleaf will expose an illegal Copycat action. The defect is in the policy's strategic availability heuristic and its tests, which can choose or prioritize Mimikyu on insufficient evidence.

This finding is separate from Agent11's Night Watch host-only coverage gate. Preserve the fail-closed physical-random boundary for the exact Trevenant & Dusknoir-GX SMP Night Watch source, but do not blanket-classify a spoofed Night Watch name with a different typed source (e.g. Quick Ball) as host-only; the protocol must match the projection's exact-source predicate. The proposed receipt work is for supported non-GX attacks such as Max Geist or Apex Dragon, not a request to route actual Night Watch random selection through the worker.

## Existing receipt substrate and production gap

- `simulation/twinleaf/agent8-public-event-receipt.cjs` accepts an explicit `previousOpponentTurnAttacks` argument and can produce a public receipt containing `opponentLastTurnAttacks`.
- `simulation/twinleaf/agent7-copycat-history-root.cjs` adds a tracker-backed prior-turn snapshot and validated `opponentCopycatChoices`, including a single eligible attack or a verified paired sequence. It also emits `mimikyuCopycatCompatible`.
- `tests/agent7-copycat-history-root.test.cjs` exercises known, unknown, empty, incompatible, and malformed history cases.
- The current V3 runner imports Agent8's `publicEventReceipt` directly and, in `createV3WorkerDecisionResolver()`, calls `eventReceipt(request.state, actorSeat, null, null)` (around line 1396) for actor-root requests. Thus the previous-turn attack and turn arguments are explicitly null; it does not attach Agent7's tracker-certified Copycat choice set.

Therefore the production vertical slice correctly remains unsupported for Copycat until authenticated history is wired through. The policy's current-active heuristic is not a substitute for that missing receipt.

## Recommended disposition

1. Keep the frozen Agent6 policy v1 and V3 runner unchanged until the current worker acceptance gate passes.
2. Keep Copycat fail-closed/unsupported in production; do not count its presence as a working counterline.
3. After acceptance, integrate a tracker-authenticated prior-turn snapshot into the V3 actor observation. Prefer the validated `opponentCopycatChoices` from Agent7's helper over reconstructing eligibility from the current Active.
4. Revise the policy's Copycat eligibility to require the authenticated eligible choice set and the correct active Mimikyu, rather than current Active attack presence.
5. Add regressions for:
   - current opponent Active has a non-GX attack but no qualifying attack was used last turn;
   - qualifying non-GX attack was used last turn by a Pokémon that is no longer Active;
   - a GX attack was used last turn;
   - no prior-turn snapshot is available;
   - malformed or incomplete tracker choices fail closed.
6. Preserve the distinction between a rules-correct Copycat decision and a complete competitive counter-ALS. The candidate's Mimikyu GRI 58 / Dialga-GX UPR 100 line against Regidrago still requires actual native execution, a competent opponent policy, and matchup evidence.

## Evidence classification and limitations

- **Rules-derived:** the card database's Mimikyu GRI 58 attack text imposes the prior-turn, non-GX condition.
- **Source inspection:** the Agent6 policy's current-active heuristic and the existing Agent7 receipt helper are directly visible in the pinned research code.
- **Integration status:** the current V3 runner does not supply the tracker-backed prior-turn receipt.
- **Not established:** no game, matchup, win rate, or deck-strength conclusion follows from this audit. No decklist change is proposed.

This finding was handed to Agent49 for post-acceptance integration planning, Agent11 for adversarial rule/policy review, and Agent7 for confirmation of the tracker API contract.
