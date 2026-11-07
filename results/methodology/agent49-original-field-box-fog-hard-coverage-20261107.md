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

### Exact selector reaches the unfillable plan in a synthetic owner state

A follow-up regression imports **the actual, unchanged Agent43
`choosePublicOneEnergyBoxKo` function**. For each original rank **9, 17, 30**,
the authenticated 60 contains *Unown AOR* with the one-Colorless, 10-damage
Hidden Power attack as well as the physical Item/hand prerequisite copies.
In a deliberately constructed owner-public root with four corresponding
held cards, unpowered Active Unown, unused ordinary Energy attachment and
an opposing 70-HP Active with 60 damage, **the hook returns an attack plan
for all three ranks**, regardless of the known absence of Fog from each
fixed roster. The subsequent required Fog search therefore has no eligible
matching original owner-deck object for this recipe.

The standalone
[`agent49-original-field-box-fog-hook-unfillable-plan.test.cjs`](../../tests/agent49-original-field-box-fog-hook-unfillable-plan.test.cjs)
passes its **three-rank synthetic positive test** with the actual imported
hook in an isolated V8 harness. This strengthens the conditional algorithm
failure from static-source reasoning to an executable pure decision-policy
counterexample. It remains **synthetic**: no actual original source root has
been shown to meet that particular combination of held cards, board
position and damage, and no real native error is asserted.

## Reproducibility

- Read-only, roster-validated
  [coverage analyzer](../../simulation/evaluation/agent49-original-field-box-fog-hard-coverage.cjs)
  checks every original rank once, exactly 60 copies, and separate
  trigger versus downstream necessary card counts.
- [Three census regressions](../../tests/agent49-original-field-box-fog-hard-coverage.test.cjs)
  include the actual 29 source rows and synthetic positive/negative complete
  60s; a source with all needed cards is classified only as having
  **inventory compatibility**, never paper playability.
- [One additional imported-hook regression](../../tests/agent49-original-field-box-fog-hook-unfillable-plan.test.cjs)
  confirms the exact selector proposes the missing-search target line in
  an otherwise plausible synthetic owner-public root for each of ranks
  9, 17 and 30.
- The fetched actual module, actual 29-deck roster and three tests executed in
  an isolated V8 test harness with minimal Node assertions: **3/3 passed**.
  The separate imported-hook counterexample **1/1 passed**.
  This is **not** a Node22 CI job or a native Twinleaf Store experiment.

The benchmark remains 29/32 authenticated fixed original inventories,
zero competitive-qualified games, no selected final 60 and no evidenced
99.5% field win rate.

## Reusable owner-original-60 hard-plan veto (6 November context corrected 7 November)

A new pure
[`owner-original-60-plan-gate.cjs`](../../simulation/twinleaf/owner-original-60-plan-gate.cjs)
supplies a conservative K0-safe structural certificate for any declared
finite plan requiring named own-deck target cards. It accepts the acting
owner's **trusted registered 60 physical printing strings**, alongside
required roles and source-validated acceptable printings. When a necessary
role has fewer copies in the original 60 than the plan requires, it emits
`blocked-impossible-original60`. If the plan's original 60 has sufficient
copies, it emits only `not-disproven`.

This complements the already existing
`simulation/twinleaf/actor-k1-search-plan-veto.cjs`: K1 can eventually
establish exact remaining deck membership from an owner-authorized search,
whereas the original 60 gives a **hard impossibility veto already at K0**
without inspecting unsearched decks or hidden Prizes. Callers must provide
authentic owner deck registration rather than reconstruct it from the
opponent's hidden cards, and must explicitly validate equivalent-printing
alternatives. A card in the original 60 might still be Prized, already used,
or inaccessible in the current deck; the helper never certifies its current
availability.

The module also refuses overlapping acceptable printings across distinct
compulsory roles. Without that restriction, one physical card could be
double-counted as simultaneously fulfilling two independent targets.

The [four original-roster and synthetic regressions](../../tests/agent49-owner-original-60-plan-gate.test.cjs)
passed **4/4** with the fetched actual code and original roster in a
separate isolated V8 harness. Ranks 9/17/30 are correctly hard-blocked
from searching for Fog at K0. Ranks 1/31 are `not-disproven` for Fog
membership, without any assertion about a usable same-turn Box line.
No native actions, qualified games or shared-policy integration occurred.


## Follow-up: opt-in hook now protects against guaranteed-absent registered targets

Following the hard-zero census and imported-hook counterexample, the
historical **default-off** `agent43-owner-secretbox-fog-ko.cjs` wrapper
now has a registered-original-60 and publicly visible owner-zone preflight (**v3**). At each genuine
`headless.runMatch(request)` boundary it captures only the acting
player's own fixed registered 60-card strings from the already-provided
`request.deckA/deckB` arrays. Before replacing an ordinary native
Pass with a paid Secret Box, it checks both:

- At least one `Fog Crystal CRE` exists in the actor's **original 60**.
- At least one Basic `Psychic Energy` printing exists in that same
  original 60, with explicit distinct native fullName strings.

The pure function
`choosePublicOneEnergyBoxKoWithRegistered60` wraps the original public
attack selector with these necessary K0-safe inventory checks.
The genuine callback increments `original60HardVetoes` when an otherwise
plausible owner action lacks the required original cards and lets the
ordinary AI action stand. The source-independent public attack evaluator
itself remains unchanged.

The expanded
[`agent49-original-field-box-fog-hook-unfillable-plan.test.cjs`](../../tests/agent49-original-field-box-fog-hook-unfillable-plan.test.cjs)
imports the **actual revised hook**, with **3/3 passing pure cases**:
(1) all three original 9/17/30 printings fire the legacy selector but
are vetoed by their genuine source 60; (2) a synthetic candidate 60 with
real Fog and Basic Psychic retains the same proposed one-Prize attack;
(3) a synthetic source containing Fog but no Basic Psychic is vetoed.
The module was fetched and executed in an isolated V8 harness. No Node22
CI or new native Store match is claimed.

**Scope of repair:** This prevents committing a Box on a deck that
could **never** contain the downstream named targets. It does not
prove targets remain in the current unseen deck. All registered Fog
or Basic Psychic copies could still be Prized, exhausted or otherwise
inaccessible; a stronger native prompt fallback and K1-aware target
selection may still be necessary. Earlier historical native treatment
provenance is pinned to its original source SHA and remains valid as
a separate archived observation. The new hook requires new native
replay verification before adoption as competitive policy.

## K0 upper bound improves on mere starting-deck membership

Starting-60 membership cannot certify current deck contents. Even before
the first owner-authorized deck search, a player can deduct every physical
card already known in their own hand, discard, Lost Zone, attached board,
Stadium, or currently resolving Supporter from the registered 60.
The new read-only
[`preflightVisibleOwnerRemainingUpperBound`](../../simulation/twinleaf/owner-original-60-plan-gate.cjs)
uses the existing `knownOutsideDeck(actorObservation)` helper for exactly
those owner-known zones. An exhausted necessary target yields
`blocked-impossible-visible-exhaustion`; a possible residual copy
yields only `not-disproven`, with all face-down Prize identities still
unknown. It fail-closes when a presented visible physical printing count
exceeds the registered original60 (provenance inconsistency).

[Three dedicated pure regressions](../../tests/agent49-visible-owner-deck-exhaustion-gate.test.cjs)
pass against the fetched actual helper: 4/4 Fog already held/discarded
vetoes Fog; all three Basic Psychic already attached/discarded veto Basic;
a residual possible card preserves uncertainty and an injected
opponent-hidden-data trap is never read.

The default-off original Agent43 Box/Fog wrapper now uses this stronger
K0 public-zone bound as well as the registered 60 for the two named search
targets, with a combined `ownerK0TargetHardVetoes` counter (v3). The
[original-field hook regressions](../../tests/agent49-original-field-box-fog-hook-unfillable-plan.test.cjs)
are **4/4 passing** in isolated V8: zero-Fog source ranks 9/17/30,
synthetic eligible candidate, zero-Basic negative, and otherwise eligible
but **visibly exhausted Fog or Basic** negative. The real Store owner-only
prompt flow and earlier historical root93 candidate payoff have not been
replayed on the revised hook. This is a conservative plan admissibility
improvement only; no new winner, match result or paper legality is claimed.

## Real native whiff semantics and v4 adapter repair

**Important correction to the original risk description.** Agent21
independently ran **four real pinned Twinleaf Store cases** across
both physical seats:
[green CI 42348491623](https://github.com/FlareZ123/experiment-01/actions/runs/42348491623),
[reported native source test](../../tests/agent21-secretbox-target-whiff-native.test.cjs),
[physical receipts](agent21-pinned-native-box-fog-search-whiff-20261107.md).
When the physically paid Box has no Fog in its actual owner deck,
the native ChooseCardsPrompt has `min:0,max:0`,
`validate([])===true`, and accepts `ResolvePromptAction(id,[])`.
After a paid Fog yields no Basic Psychic Energy or eligible Basic
Psychic Pokémon, the native prompt similarly permits `[]`.
Box, three paid cards, and played Fog correctly remain discarded.
There is **no intrinsic native crash or illegally playable Box** merely
because the desired search target is absent. The error was in this
developmental **JavaScript tactical wrapper** using
`assert.ok(fog)` / `assert.ok(basic)`.

The default-off Agent43 wrapper was therefore updated to **v4**.
The new pure helper
`choosePhysicalOwnerSearchOrWhiff(prompt, owner, predicate)`
chooses one original physical card if and only if the owner-authenticated
native prompt validates it. If no desired legal physical card is
selectable and `prompt.validate([])===true`, it submits exactly the
native zero-card resolution and records
`box-search-whiff` or `fog-search-whiff`. The audit tracks
`nativeSearchZeroSelections` and preserves the already paid Box,
Fog and discard receipts. The specialized plan is then cleared so
ordinary AI may continue on later roots. If the current native prompt
cannot validate `[]`, the wrapper delegates that prompt to the
original AI and records `nativeSearchDelegatedWhiffs`; it never
invents a required target.

[Five pure regression cases](../../tests/agent49-native-owner-search-whiff-fallback.test.cjs)
passed **5/5** against the actual fetched amended wrapper in V8,
covering physically valid one-card search, both legal zero-card searches,
native non-optional delegation and native-ineligible candidate with a
valid empty alternative. These are **developmental pure adapter tests**;
the native **4/4 proof belongs to Agent21's independent pinned Store
fixtures**, and Agent49 has not yet rerun the full wrapper v4 in a real
native match. The guaranteed-absence K0 hard gate still prevents
wasting Box in known-impossible plans before payment. Genuine uncertainty
from Prizes and prior-use effects can produce whiffs; those must remain
valid observed negative outcomes.

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
