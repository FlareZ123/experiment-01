# Exact frequency of the previous-turn K1 Thunder-to-Speed opportunity in all three published Iron Thorns source 60s

**Agent 6 | 1 November 2026 | analytical card-location result, no native game-outcome inference.**

## Why this calculation matters

The previous [genuine same-deal owner K1 experiment](agent6-cross-turn-owner-k1-native-speed-recovery-20261101.md) demonstrated that preserving a real first-turn Tag Call deck inspection into the subsequent source turn can restore a **native 140-damage Volt Cyclone** instead of an aborted Stadium search. That experiment deliberately selected a source opening already known to have Tag Call and the necessary Energy; it cannot establish the prevalence of that state. This analysis supplies an exact, source-60 card-location baseline for the specific route, while leaving playable discard payment and overall policy/game strength unanswered.

The archive has three authenticated Aichi Open 2026 published original Iron Thorns 60s sharing precisely four Iron Thorns ex Basics, two Tag Call, two Guzma & Hala, one Thunder Mountain Prism Star, and four Speed Lightning Energy. They differ in Double Colorless Energy copies:

| Original rank | DCE copies | Other cards after categorization | Exact qualifying deals | Share of all Basic-valid source-first openings |
|---|---:|---:|---:|---:|
| **6** | 1 | 46 | **348,113,824,505,220** | **0.2091042068%** |
| **24** | 3 | 44 | **947,108,318,772,492** | **0.5689068339%** |
| **29** | 1 | 46 | **348,113,824,505,220** | **0.2091042068%** |

The original printed inventories are checked against [the exact source 60s](full-decklists.json) inside the executable script. Same quantitative categories imply the same result for ranks 6 and 29; differences among the other Trainers still matter to real action feasibility.

## Exact event definition

Condition on the source electing to go **first** and an original seven-card starting hand containing at least one Basic. Deal the remaining 53 as six face-down Prizes, then take the ordinary first-turn draw. Omit opponent mulligan bonus draws, extra Trainers and later actions. The fixed eight own visible cards (original seven plus ordinary first draw) must satisfy all of:

1. At least one **Tag Call** in hand, with **no G&H** already held, so a first-turn search can bank the Supporter.
2. At least one **DCE** in hand available for source-first manual Energy attachment.
3. The singleton **Thunder Mountain** outside those eight and specifically in the six Prizes, so a first genuine owner deck search can reveal its absence.
4. At least one G&H and at least one Speed Lightning remain in the **searchable deck** after Prizes and the ordinary draw.

These are simultaneous physical location conditions and a **necessary envelope** for the specific earlier-K1, preattached-DCE, later G&H-for-Speed search branch. A true playable turn still requires an actual Basic Active, Tag Item permission, legal G&H Supporter permission on the later turn, the ability to discard two **strategically acceptable** other cards, an unused Energy attachment, opponent responses and a suitable attacking board. The event excludes other potentially viable routes, including directly holding Speed or drawing DCE on the second owner turn; it cannot bound all future attack possibilities.

For a chosen eight-card multiset containing `b` Basics, `t` Tags, `d` DCE and `s` Speed, the number of valid ways to designate which of its cards is the **last draw** is (8) if `b >= 2`, or (7) if `b = 1` (the lone Basic cannot have been drawn after the seven-card setup). From the remaining 52 cards, the six Prize set must contain the one Thunder while leaving at least one G&H and Speed searchable. The [BigInt script](../../scripts/agent6-rank6-k1-speed-prerequisite-exact.cjs) sums the resulting finite multivariate hypergeometric counts without floating-point arithmetic until final display.

The exact denominator, shared by all three sources, is

\[
Z=\left[8\binom{60}{8}-53\binom{56}{7}\right]\binom{52}{6}
=166478632771651200.
\]

This equals the independent earlier [seven, Prize, draw rank6 enumerator](agent6-rank6-firstdraw-tagcall-prize-joint-20261101.md), which ordered physical events differently. All categories are mutually exclusive, including the published one-or-three physical DCE copies.

## Reproduction and limits

- [CommonJS exact calculator](../../scripts/agent6-rank6-k1-speed-prerequisite-exact.cjs); [six independent/pure tests](../../tests/agent6-rank6-k1-speed-prerequisite-exact.test.cjs), including **three separately labeled physical mini-deck enumeration checks** and rank24 multiple-DCE enumeration.
- [Manual opening audit 41359645388](https://github.com/FlareZ123/experiment-01/actions/runs/41359645388) green on initial rank6 source count, then the extended rank6/24/29 tests passed in [manual opening audit 41359824099](https://github.com/FlareZ123/experiment-01/actions/runs/41359824099), both Node 22 with source manifest intact. No simulator needed for these mathematical counts; no vendor, decklist or shared qualified two-player policy changed.
- The main [native cross-turn 140-damage positive control](agent6-cross-turn-owner-k1-native-speed-recovery-20261101.md) concerns original rank6 and is not repeated for rank24 or rank29. The 0.5689% rank24 number describes possible *physical cards* in this narrow opening, not a 0.5689% match-win improvement or evidence about optimal deck choice.
- This is a **low-base-rate but potentially high-impact** source-planning issue. The relative ranking of preserving late owner K1 versus other policy shortcomings needs prospective full-field, symmetric, correctly printed and clock-qualified games, currently unavailable.

**Benchmark unchanged: 29/32 authenticated exact Aichi source sixties, zero competitively qualified games, no validated fixed deck or 99.5% win-rate evidence.**
