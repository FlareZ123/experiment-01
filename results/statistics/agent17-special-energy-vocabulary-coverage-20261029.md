# Agent 17: actual actor numeric Special Energy vocabulary across original Aichi 60s

**29 October 2026. Static implementation coverage, zero gameplay assertions.**
Source: [all 29 exact original printed sixties](../aichi-2026/full-decklists.json);
executed code [agent17-special-energy-vocabulary.cjs](../../scripts/agent17-special-energy-vocabulary.cjs);
[regression](../../tests/agent17-special-energy-vocabulary.test.cjs).
The test invokes the actual `specialEnergyUnits` switch from
[agent3-special-energy-frontier.cjs](../../simulation/twinleaf/agent3-special-energy-frontier.cjs)
using the exact source printing strings, instead of inferring
support from the abstract Energy type.

## Result

| Meaning | Exact count |
| --- | ---: |
| Verified original opposing source sixties | 29/32 |
| Source sixties carrying any Special Energy | 24/29 |
| Physical Special Energy copies among all source sixties | 118 |
| Copies recognized by the existing numeric frontend | 38 |
| Copies not recognized | **80** |
| Special-carrying original sixties with all printings recognized | **6** |
| With partially recognized printings | **3** |
| With zero recognized printings | **15** |

The **fully recognized** original ranks are **3, 5, 6, 24, 26, 29**;
**partially recognized** are **2, 7, 15**;
**zero recognized** are **4, 9, 10, 12, 13, 14, 17, 18, 19, 20, 21,
27, 30, 31, 32**.

The code currently provides numeric units for **Double Colorless
Energy SUM**, **Speed Lightning Energy RCL**, **Capture Energy RCL**,
and **Spiky Energy JTG** from the original 29-list corpus. It separately
models a Telepath M3 printing used in research candidate experiments;
the originally listed Telepathic Psychic Energy POR is a different
source identity and is not recognized by this exact-name switch.

Most importantly, original **ranks 4 and 17**, both Raichu Electrode
decks, each carry **4 Reversal Energy PAL, 4 Counter Energy CIN, and
4 Unit Energy LPM UPR**. All twelve physical Special Energy cards per
list are unsupported by the generic numeric frontier. Those are
among the seven original Special-only opposing lists.

## Direct held-card coverage of seven Special-only originals

These numbers are **numeric vocabulary exposure probabilities only**,
conditional on a Basic-valid original opening seven and at most one
ordinary draw, with no searches, opponent bonus draws or game actions.
They reuse the exact BigInt source model in
[agent17-special-only-opening-exposure-20261029.md](agent17-special-only-opening-exposure-20261029.md).

| Original rank | Physical Special count | Numeric-recognized copies | Initial 7 has recognized Special | By one ordinary draw |
| --- | ---: | ---: | ---: | ---: |
| 4, 17 | 12 | 0 | 0% | **0%** |
| 5 | 4 | 4 | 37.884168% | **42.572155%** |
| 6, 24, 29 | 8 | 8 | 61.011294% | **66.896381%** |
| 7 | 4 | 2 | 20.931886% | **23.915589%** |

Although ranks 4 and 17 have 83.991994% direct natural access to
*some* physical Special Energy by the eighth card, the current numeric
frontier cannot recognize any of their exact original Energy
printings. Rank 7 similarly has only partial coverage. Thus enabling
the existing `specialEnergyRoot` development flag does **not**
repair the common-policy gap for the full opponent field.

## Interpretation and next gate

This is a **lower-level numeric-type vocabulary audit**. Recognition
does not prove a native-attached card is legal, that it has an
appropriate recipient, that the card can be played at that moment,
that the bot would choose it, or that its complete native effect would
resolve. The actual actor root's Special Energy branch remains an
opt-in, may prefer printed attacks, and currently targets Active for
most Energy printings. The unmodified Store, other actions and
opposing hidden information have separate qualification problems.
Unsupported exact printing names are therefore credible missing
model coverage; this calculation cannot supply actual missed-action
rates or competitive win claims.

**Priority:** Expand the shared owner-observation-safe actor
Energy capability with native tests for the commonly exposed
previously unsupported Special families. Rank 4/17 **Reversal,
Counter, Unit Energy** should receive conditionally legal and
consequential board tests. Other names needing attention include
**Double Dragon, Jet, Prism, Telepathic Psychic, Recycle, Memory,
Powerful Colorless**. Preserve the printed target restrictions and
conditional units for each Energy: blindly treating all Special
Energy as one Colorless would be unsound. Reuse the canonical
bilateral bot and existing manual CI. For authentic source decks,
collect held -> actually playable -> Store accepted -> fully settled
-> opponent reply evidence, and record the score/reason for
rationally held Energy.

Original source ranks **23, 25, 28** still unknown. **Zero
competitively qualified games**, no final verified single 60, and
no established 99.5% win rate.
