# Agent 17: reuse an existing conditional Energy matcher before extending the canonical actor

**29 October 2026. Mechanism coverage comparison only.**
The narrow generic actor numeric Energy switch in
[agent3-special-energy-frontier.cjs](../../simulation/twinleaf/agent3-special-energy-frontier.cjs)
is not the sole implementation of printed Energy semantics in the
repository. The existing
[actor-energy-payability.cjs](../../simulation/twinleaf/actor-energy-payability.cjs)
already supports flexible type-matching and two important conditional
Special families. The [side-by-side executable audit](../../scripts/agent17-energy-model-bridge-coverage.cjs)
calls both modules on exact printed original cards, with
[regressions](../../tests/agent17-energy-model-bridge-coverage.test.cjs).

## Source-deck coverage comparison

| Exact named-printing support | Narrow numeric actor frontier | Existing conditional Energy matcher |
| --- | ---: | ---: |
| Original Special Energy copies | 118 | 118 |
| Recognized numeric/card-type printings | **38** | **88** |
| Unrecognized printed copies | **80** | **30** |
| Original Special-bearing ranks with full recognition | 6 | **16** |
| With partial recognition | 3 | **6** |
| With zero recognition | 15 | **2** |

Full recognition under the richer module:
**3, 5, 6, 10, 12, 13, 14, 18, 19, 20, 21, 24, 26, 27, 29, 32**.

Partial: **2, 4, 7, 9, 15, 17**.
Zero: **30, 31**.

**What explains the 50-copy difference?** The conditional module can
represent **38 Double Dragon Energy ROS** source copies as flexible
two-unit Energy *on a Dragon*, **8 Reversal Energy PAL** as potentially
triple flexible Energy on a prize-behind eligible Evolution, and
**4 Prism Energy ASC** as one flexible unit on a Basic. The narrow
numeric frontier currently represents none of these exact printings.
The other 38 previously recognized printed copies remain covered.

The two modules are tested against **hypothetical public contexts**
that make a recognized card's printed effect expressible. This does
not establish a legal recipient or a real turn where conditions held.
A false-context Double Dragon or Reversal check must still be
respected; this audit must never be used to auto-attach or assume
those conditional benefits in every board.

## Remaining 30 copies and alias caveat

The existing richer matcher also does not model the following
exact source strings in the unchanged published 29-sixty manifest:

| Unrecognized exact-source printed name | Physical copies |
| --- | ---: |
| Counter Energy CIN | 8 |
| Unit Energy LPM UPR | 8 |
| Telepathic Psychic Energy POR | 6 |
| Jet Energy PAL | 5 |
| Recycle Energy UNM | 1 |
| Memory Energy LOT | 1 |
| Powerful Colorless Energy DAA | 1 |
| **Total** | **30** |

The Unit Energy issue merits a **printing/engine alias check**.
The public card snapshot uses the longer English name
`Unit Energy LightningPsychicMetal` at its Ultra Prism printing,
while the source manifest abbreviates this family to
`Unit Energy LPM`. The richer matcher already recognizes the
longer spelling. An engine proxy could normalize this name when
resolving the original source row; no such conversion is asserted
here. Any fix should use source-card identity/print mapping rather
than an unverified prefix substitution.

Counter Energy is also conditional, providing two flexible units
when a behind-on-Prizes eligible Pokémon that is not Pokémon-EX or
Pokémon-GX is attached (the printed card text is more specific
than the generic modern Rule Box model). No unconditional
two-unit mapping is justified.

**Actionable engineering direction:** Use the existing
context-aware, non-greedy string-unit matching as an internal
reference when implementing a shared generic actor Special Energy
decision. Its conditional `energyUnits` and `canPaySymbols`
functions should be adapted carefully to the native enum
interface and current public active/Bench recipient. Preserve
both-player owner observations, action quotas, printed recipient
restrictions, full card on-attachment effects and Store acceptance.
A naïve conversion from a flexible set to one fixed native type would
create misleading attack or attachment lines.

All findings are source inventories and code implications. They
are **not legal action certificates, gameplay trials or performance
estimates**. The primary 29/32 opposing 60s remain incomplete at
ranks 23/25/28; zero competitively qualified games; no established
single fixed 60 with 99.5% field win rate.
