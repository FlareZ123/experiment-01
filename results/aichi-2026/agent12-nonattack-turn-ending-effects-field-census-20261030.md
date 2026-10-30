# Agent 12: Nonattack turn-ending triggers in eight Aichi source 60s

**30 October 2026.** Exact source-card and English printing audit; **not a gameplay observation, competitive win, or exhaustive effect scanner.** The recovered opponent field remains **29/32**, missing ranks **23, 25 and 28**.

## Exact print crosswalk

The original [29-source manifest](full-decklists.json) was matched by name, set code and card number to six specific English card-database IDs, whose printed rules/Abilities explicitly contain a turn-ending clause:

| Rank | Exact identified printing | Count | Actual turn-ending event |
| --- | --- | ---: | --- |
| 1 Shadow Rider | Radiant Eternatus CRZ 105 | 1 | **Optional** Climactic Gate Ability on Benching |
| 3 Snorlax Stall | Rotom V LOR 58 | 1 | **Activating** Instant Charge Ability |
| 3 Snorlax Stall | Tropical Beach BWP 50 | 1 | **Using** the Stadium's optional draw effect |
| 6 Iron Thorns | Camping Gear BST 122 | 2 | **Playing** the Item |
| 6 Iron Thorns | Tropical Beach BWP 50 | 1 | Using Stadium effect |
| 7 Snorlax Stall | Steven's Resolve CES 145 | 4 | Playing the Supporter |
| 8 Absol Garbodor | Boost Shake EVS 142 | 1 | Playing the Item |
| 11 Absol Garbodor | Boost Shake EVS 142 | 2 | Playing the Item |
| 16 Absol Garbodor | Boost Shake EVS 142 | 2 | Playing the Item |
| 29 Iron Thorns | Camping Gear BST 122 | 2 | Playing Item |
| 29 Iron Thorns | Tropical Beach BWP 50 | 2 | Using Stadium effect |

**Totals: 8 of 29 recovered source 60s, 11 source printing rows, 19 copies, 6 unique English print identities.** This is a *deck-construction coverage measure*; none of these cards is thereby proven drawn, legally playable at a particular turn, chosen, or settled. The original 32-arm scout has a distinct native source Boost Shake turn-ending demonstration without Pass ([Agent1's summary](agent1-original-source-held-opening-census-native-20261029.md)), which is independent of this paper-card inventory.

**Important trigger distinction:** Playing Tropical Beach itself does **not** end the turn; using its printed optional effect does. Benching Rotom V does **not** trigger its end-turn Ability. Radiant Eternatus's optional on-play Ability ends the turn only when used. The source fields contain **Snorlax PGO 55** in ranks 3 and 7, whose *Block* Ability is different from the turn-ending Gormandize on **Snorlax VIV 131**. Name-only matching would be incorrect. An effect ending the turn may also entail prompt and settlement subtleties.

## Authenticated owner-hand first-turn exposure in the original 32 arms

A **separate historical native observation**, independently re-read on 30 October from Agent1's [corrected frozen 32-arm owner-hand archive](https://github.com/FlareZ123/experiment-01/actions/runs/40986317488/artifacts/12946843277), ZIP SHA-256 `5bec95b85ef00129f765214a8b75cb02631d1e6bbd330f805ca29ca366933f2f`, supplies a concrete policy-coverage warning. The raw `agent25-registered-32-owner-census-raw.json` contains **16 rank-6 original game arms**, 14 with the source actually first. In **six** of those fourteen source-first arms, the original source owner's *first physical hand* contained **one Camping Gear BST**, yet the actual original owner first-turn root was directly `PassTurnAction`, with **no other source owner root before it**. Crucially, six arms collapse to only **three distinct original source physical-deal SHA-256 fingerprints**, each replayed against both fixed candidate sixties:

| Original preregistered source deal | Candidate arms | Camping Gear at owner's global-T1 root | Original source action |
| --- | --- | ---: | --- |
| Rank6 repeat 0, candidate seat A, source-deal SHA prefix `08bf124fc4b6` | Champion + New Moon | 1 in each | Pass |
| Rank6 repeat 2, candidate seat A, source-deal SHA prefix `85dca969d95f` | Champion + New Moon | 1 in each | Pass |
| Rank6 repeat 0, candidate seat B, source-deal SHA prefix `5bbe1b1fa0a` | Champion + New Moon | 1 in each | Pass |

The archived paired source-deal and original-root SHA fingerprints match the original native 32-arm archive; this first-turn owner-hand observation was a read-only addition to the unchanged original actions, as [Agent1's direct native replay comparison](agent1-original-32-native-firstturn-closure-20261030.md) established. The source is rank6 **Iron Thorns ex**, whose supplied printed Camping Gear Item permits an unrestricted search of one card before ending the turn. These genuine **held-and-Passed** states provide a better targeted native root/follow-through regression than inventing a hypothetical hand. They do **not** prove the play would have been natively accepted, strategically superior, or worth surrendering a later Camping Gear use. The actual source owner did not play Camping Gear on these observed global-T1 roots. Agent6 [independently documented other source-dealt first-turn hands](agent6-rank6-source-first-k0-item-contender-20261030.md) with Camping Gear in its fixed six-seed cohort. Do **not** combine those distinct sampled/replayed seed frames into a population rate.

An important negative: another source first-turn hand held **Boost Shake** with no qualifying Basic evolution line established. Merely holding a conditional Item is insufficient evidence it can resolve; a first-turn Camping Gear search and a Boost Shake evolution have different necessary preconditions. A priority chooser should distinguish both native acceptance and whether retrieving one resource now improves the continuation over holding it. The owner-first-turn Supporter restriction does not disable Item usage, but native legality still has to be checked.

## Reproduction

- [Pure read-only script](../../scripts/agent12-aichi-nonattack-turn-end-census.cjs) reads the already committed `resources/cards/en/*.json` and `results/aichi-2026/full-decklists.json`; validates each of six exact English card IDs, printed name, turn-end text and activation type; computes the rank/copy denominator without modifying a game.
- [Five tests](../../tests/agent12-aichi-nonattack-turn-end-census.test.cjs) verify six IDs and printed clauses, 8/11/19 tally, played-versus-activated semantics, wrong-print rejection and wrong-Ability rejection. **5/5 passed** when executed in a compatible independent V8 harness over the exact remotely read-back code, tests, original source manifest and six genuine card JSONs. These are **pure tests, not compiled native Twinleaf CI**.
- [Owner action-order matrix](../../simulation/twinleaf/agent12-owner-sequence-compatibility.cjs) and [seven separate pure tests](../../tests/agent12-owner-sequence-compatibility.test.cjs) provide same-root structural conflicts and require native fresh-root evidence for any nonterminal follow-through.

## Common policy handoff

The Agent41 unified actor-visible chooser must distinguish `root action accepted`, `native effect pending`, `effect settled`, `turn advanced`, and `new owner root accepted`. An Item such as Boost Shake or Camping Gear may be **terminal**. A Bench/Ability or Stadium card may be **nonterminal until its optional effect is used**. The source policy may choose a resource-preserving hold even when a terminal effect is present. Preserve print identity, actual actor-only information, native acceptance/physical targets and prompt errors.

[Agent16's existing sequential recovery helper](../../simulation/twinleaf/agent16-root-recovery-trace.cjs) explicitly closes a turn only on `attack` or `pass`; this inventory provides a concrete printed negative regression class. Before marking a nonattack turn end in a live trace, authenticate the native **post-prompt turn advance** rather than inferring it from a root card name.

**Qualification:** 0 competitively qualified games, no validated single fixed 60, no demonstrated 99.5% across the Top32.
