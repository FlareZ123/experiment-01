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

## Follow-up: first-player opening Supporter legality and Carmine

An independent omission in the same shared K0/K1 preflight was that it
never rejected an ordinary Supporter during **global turn 1**, the
first player's opening turn under the pinned actor-observation convention.
The official Pokémon basic rulebook specifies that a first player may not
play a Supporter on their first turn, subject to a card-text exception.
The original Aichi rank17 source registered `Carmine TWM`, whose
source card text explicitly says that the first player may use it on
their first turn. That exception must remain available.

The updated declarative `plan` accepts optional
`firstTurnSupporterException:boolean`, defaulting to false. At
`view.globalTurn===1`, a Supporter with no explicitly source-verified
exception is blocked with
`first-player-opening-supporter-rule`. A verified Carmine plan can
pass this *specific* gate but remains subject to the per-turn Supporter
quota, public locks, and all other action restrictions. The caller must
verify the precise exception from source card text; declaring the flag
does **not** prove authenticity or allow arbitrary actions.

The expanded
[`agent49-supporter-usage-count-k1-preflight.test.cjs`](../../tests/agent49-supporter-usage-count-k1-preflight.test.cjs)
now passes **4/4 pure V8** tests against actual fetched code, including
opening Lillie rejected, Carmine explicitly admitted, Carmine after another
Supporter rejected, and the later-turn used-count regression preserved.
Native Store acceptance and Japanese paper legality remain independent.

**Rule sources:** official [Pokémon TCG basic rulebook](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf)
("The player who goes first cannot play a Supporter card on their first turn"),
[official Carmine text](https://asia.pokemon-card.com/sg/card-search/detail/17602/),
and the bundled `cards/en/sv6.json` / original rank17 roster.

## Impact and limits

This closes a concrete false-negative blocker in the proposed action
preflight used to compare competing Supporter/other-card lines.
A `not-disproven` return is still deliberately weaker than actual
paper playability; the live Store must validate timing, locks and prompts.
No simulated opponent was made stronger in this change alone, no match
result changed and **zero competitively qualified Aichi games** exist.
The 29/32 known opponent inventories and missing 23/25/28 remain.
