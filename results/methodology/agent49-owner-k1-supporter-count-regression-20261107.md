# Agent49: owner K0/K1 Supporter preflight used wrong unit, now corrected

**7 November 2026 | rules-consistency repair, no native game rerun.**
The flaw is in a shared search-plan preflight, independent of any one deck's
rank or source printing.

## Proven mismatch

`simulation/twinleaf/actor-observation-contract.cjs` provides:
`ownTurnResources.supporterPlayedTurn = owner.supporterTurn`.
The interface explicitly documents that **`supporterTurn` is a count
of Supporters already used during the player's current turn**.
The same contract describes **`energyPlayedTurn`** and
**`stadiumPlayedTurn`** as actual global-turn indices.
The existing `agent5-generic-owner-trainer-opportunity.cjs` and
`agent12-actor-only-lillie-after-pass.cjs` independently check the
Supporter quota with `supporterPlayedTurn > 0`.

The old shared
`simulation/twinleaf/actor-k1-search-plan-veto.cjs` used:

```js
if(r.supporterPlayedTurn===view.globalTurn)
  reasons.push({kind:'supporter-quota-spent'});
```

This compares **incompatible units**. After an owner has played one
Supporter on global turn 14, the values are `1` and `14`. The
condition incorrectly fails, so a declared second Supporter plan may
receive `not-disproven` if there are no other blockers. The printed
Advanced Rulebook, Trainer cards B-03, permits only one Supporter per turn.

The corrected predicate is:

```js
if(Number.isInteger(r.supporterPlayedTurn)&&r.supporterPlayedTurn>0)
  reasons.push({kind:'supporter-quota-spent'});
```

This leaves Energy and Stadium global-turn-stamp checks unchanged.
It preserves every other plan preflight, printed 60 and selected
play policy.

## Exact pure regression

[`tests/agent49-supporter-usage-count-k1-preflight.test.cjs`](../../tests/agent49-supporter-usage-count-k1-preflight.test.cjs)
constructs a detached, source-neutral owner-root view with the genuine
resource-field semantics and a declared held Lillie's Determination
Supporter plan.

| Global turn | Current-turn Supporters used | Expected result |
| ---: | ---: | --- |
| 14 | 1 | **Blocked** by supporter quota |
| 14 | 0 | Not disproven by quota |
| 1 | 1 | **Blocked** by supporter quota |

An independent Energy plan in the same turn remains unblocked until its
`energyPlayedTurn` equals global turn 14. All **three tests passed**
in an isolated V8 harness evaluating the actual fetched shared module,
owner-K1 helper and owner-observation source with a narrow Node assertion
shim. This is **not** a Node22 CI or real Store action acceptance record.

## Impact and limits

This closes a concrete false-negative blocker in the proposed action
preflight used to compare competing Supporter/other-card lines.
A `not-disproven` return is still deliberately weaker than actual
paper playability; the live Store must validate timing, locks and prompts.
No simulated opponent was made stronger in this change alone, no match
result changed and **zero competitively qualified Aichi games** exist.
The 29/32 known opponent inventories and missing 23/25/28 remain.
