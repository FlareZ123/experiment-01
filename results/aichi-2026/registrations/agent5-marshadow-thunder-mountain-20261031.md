# Agent 5 preregistration: champion Marshadow versus source Iron Thorns Stadium

**31 October 2026, prior to native result; synthetic bounded original-Store experiment.** Source provenance is the authenticated full-decklist corpus `results/aichi-2026/full-decklists.json`: final rank 1 uses **one Marshadow UNB 81**; final ranks 6, 24 and 29 each use **four Iron Thorns ex TWM 77 and one Thunder Mountain Prism Star LOT 191**. No hidden player cards are assumed.

## Paper printed hypothesis and reason to test

Marshadow UNB (Resetting Hole) is an ordinary Basic with no Rule Box. From the Bench, its Ability lets its controller discard a Stadium and, if it does, discard Marshadow and attached cards. Iron Thorns ex (Initialization) suppresses Abilities of Rule Box Pokémon belonging to its opponent while it is Active. Since Marshadow has no Rule Box, **Resetting Hole should remain usable even with opposing Active Iron Thorns ex**. If source Thunder Mountain is discarded, its ongoing attack-cost reduction disappears at once. The main physical cost is the Bench occupant and its future lost use; its ability is not a blanket solution to the opponent's subsequent response.

## Fixed native three-branch test, both physical seats

Use pinned original Twinleaf Store commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Stage owner turn2 with Active Venonat MEW, payable Psychic-powered Gnaw, own Bench index0 Marshadow UNB; opponent Active Iron Thorns ex TWM; Thunder Mountain Prism Star LOT as the one live Stadium, and nonempty decks/prizes. The three branches must start from independently reconstructed, matching owner-visible observations:
1. Control: Gnaw now, leaving Marshadow and Stadium in place.
2. Treatment: dispatch actual Store `UseAbilityAction('Resetting Hole')` from Benched Marshadow, fully resolve native prompts and inspect its actual effects; if the original game remains open, attack Gnaw afterward.
3. Negative: same board without the Stadium, attempt the Ability and determine whether the genuine Store permits or rejects a no-change use.

Accept the mechanical positive only if genuine Store (a) accepts Resetting Hole while opposing Iron Thorns Initialization is active, (b) removes the public Stadium, (c) discards the actual Marshadow card, and (d) permits a next root (or attack) on that turn. Any unsupported card/prompt/Ability or wrong order is a named engine-fidelity limitation, never a repaired success. Run owner physical seats0 and1 and capture authentic field snapshots, owner-visible preconditions, and failure traces.

This is a staged mechanics counterfactual, **not** evidence of access, matchup prevalence, timing, actual full-deck candidate strength, or win rate. Field remains 29/32 authenticated full original 60s, zero qualified games.

## Pre-result printed Prism Star correction

**31 October 2026 ~04:17 UTC, before examining the native result.** The supplied `sm8-191` English Thunder Mountain Prism Star card explicitly states that if a Prism Star card would be discarded, **put it in the Lost Zone instead**. The original preregistration's word "discard" denotes use of Marshadow's Stadium-removal effect, **not the destination zone**. For a paper-faithful positive require **Thunder Mountain LOT in the original owner of the Stadium's public Lost Zone**, absent from Stadium and ordinary discard; Marshadow UNB itself moves to its owner's discard. Keep a wrong-zone native outcome as a fidelity failure instead of counting the Stadium as successfully removed. The amendment is logged before inspecting any engine result.

## Companion source Stadium matrix preregistration

**31 October 2026 ~04:22 UTC, before implementing or running the companion native matrix.** The exact original source corpus also contains **Path to the Peak CRE 148** (ranks 5,9,12,15,20,21,27; 8 physical copies) and **Silent Lab PRC 140** (ranks 9,13,15,32; 5 physical copies).

In an otherwise unchanged owner Bench Marshadow UNB state, with ordinary opponent Active Pidgey (to isolate a Stadium's own Basic Ability effect), predict:
- Against **Path to the Peak**, Resetting Hole *can* be used and removes the Stadium, because that Stadium suppresses Rule Box Pokémon Abilities and Marshadow UNB has no Rule Box.
- Against **Silent Lab**, Resetting Hole *cannot* remove Silent Lab while that Stadium is active, because Silent Lab turns off Basic Pokémon Abilities, including Marshadow's. A native rejection, no effect, or unresolved legality contradiction must be recorded distinctly from the Path success; no hand-selected fallback or Stadium substitution is allowed in this test.
- In a final no-Stadium negative, the Ability cannot legally discard a nonexistent Stadium.

Use matching true Store staged roots, two physical seats, actual `UseAbilityAction`, unmodified rule text, and only nondiscretionary prompt settlement. Record exact opponent Stadium destination, owner Marshadow destination, native errors, and whether the root remains ongoing. If the engine omits an Ability lock, call it a **fidelity gap** and keep the raw outcome. These tests still do not establish rank1-vs-rank9 play outcomes or field win rates. The event register and card text, not a generic name-level Standard assumption, determine the scenario.
