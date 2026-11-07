# Fixed-field hard-card audit: the Box/Fog payoff bridge cannot execute in any of the 29 authenticated original Aichi decks

**Agent49 | 7 November 2026 | source inventory and pure-logic evidence.**
The result concerns only the **specific**
`simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs` bridge;
it does not bound other source attacks, the New Moon candidate's actual
root93 payoff, or the strength of any final fixed60.

## Decision-relevant result

[Source roster](../aichi-2026/full-decklists.json) contains **29 distinct
authenticated original 60-card name/count inventories**; ranks **23, 25, 28**
are missing. Exact name-count census across these 29 gives:

| Necessary card package | Original source ranks | Decks |
| --- | --- | ---: |
| At least one Secret Box | 4, 5, 8, 9, 11, 16, 17, 19, 22, 30 | 10/29 |
| At least one Fog Crystal | 1, 31 | 2/29 |
| **Both Secret Box and Fog Crystal** | **none** | **0/29** |
| Box + at least two Battle VIP Pass + Rescue Carrier | 9, 17, 30 | 3/29 |
| Full hook package (also Fog + Basic Psychic) | **none** | **0/29** |

The exact existing Agent43 owner hook's `choosePublicOneEnergyBoxKo`
requires the owner to have Secret Box, **two** VIP Pass and Rescue Carrier in
hand. On its chosen line it then plays Secret Box, requires an owner-deck
`Fog Crystal CRE` in a real ChooseCardsPrompt, and must select **Basic
Psychic Energy** from the deck before attaching and making a one-Energy KO.
These are **necessary** inventory prerequisites, independent of future draws,
Prizes, Supporter contention and the opponent's board.

Thus **zero of the 29 authenticated original source 60s** can ever produce
this *exact internal Box/Fog recipe* through its own fixed deck inventory.
The code is installed symmetrically for both physical seats, but that is a
**code-coverage guarantee, not a source-deck functional-coverage guarantee**.
This qualifies the bridge's description as "source-independent": its actor
input does not inspect the adversary's source rank, although its current
required package makes the tactical improvement candidate-specific in the
known field. The three missing originals are unknown, not presumed negative.

## A potential live integration failure

For three original ranks (9, 17, 30), the **hand-only trigger package** is
present in the fixed 60, while **Fog Crystal is absent**. The pure
`choosePublicOneEnergyBoxKo` routine cannot see a trusted known-deck
manifest and does not check whether the deck can supply Fog before proposing
`PlayCardAction` for Secret Box. The downstream code then does:

```js
const fog=owner.deck.cards.find(x=>x.fullName===FOG&&
  pending.validate([x])===true);
assert.ok(fog,'Original owner deck has no native-selectable Fog Crystal');
```

Therefore **if** one of those source decks naturally reaches a matching
otherwise-Pass root with an unpaid lethal one-Energy attack and the requisite
four hand cards, the bridge might spend Secret Box and **abort at its Fog
search prompt**. This is a structural conditional fault, **not** evidence
that such a live source decision actually arose or that any game crashed.
Ordinary Store acceptance does not prove the existence of a follow-on search
target.

## Reproducibility

- Read-only, roster-validated
  [coverage analyzer](../../simulation/evaluation/agent49-original-field-box-fog-hard-coverage.cjs)
  checks every original rank once, exactly 60 copies, and separate
  trigger versus downstream necessary card counts.
- [Three regressions](../../tests/agent49-original-field-box-fog-hard-coverage.test.cjs)
  include the actual 29 source rows and synthetic positive/negative complete
  60s; when a source does contain all card types, the pure gate flags only
  **inventory compatibility**, never paper playability.
- The fetched actual module, actual 29-deck roster and three tests executed in
  an isolated V8 test harness with minimal Node assertions: **3/3 passed**.
  This is **not** a Node22 CI job or a native Twinleaf Store experiment.

The benchmark remains 29/32 authenticated fixed original inventories,
zero competitive-qualified games, no selected final 60 and no evidenced
99.5% field win rate.

## Direction for shared competence work

Before integrating a historically successful candidate-only tactical
adapter into a **bilateral** game policy, check source-deck-wide *recipe
admissibility*. A player's known original 60-card deck composition is
legitimate owner information. Exact remaining deck identities require a
proven K1 search or actual owner-authenticated search prompt; a K0 policy
must preserve uncertainty about Prizes and draws.

A robust bridge should be able to select alternative affordable Item and
Energy retrieval paths on the merits of owner-hand DCI, public attack
opportunities and real prompt payment, while abstaining from a plan whose
required named card does not exist in that owner's legal 60. Native Store
payments, Prize settlements and competent opposing responses must still be
audited. Avoid interpreting increased candidate attacks alone as a symmetric
competitive-opponent policy improvement.
