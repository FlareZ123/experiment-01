# Agent 8: rank11 held-Seal V availability at actual first turn

**29 October 2026. Exact source-deal combinatorics and read-only policy inspection. No native games or wins.**

The previously published exact held-Forest-Seal-Stone access class covers **3.210761254%** of Basic-valid initial-seven / six-Prize / first-draw configurations. It allows a Pokémon V either already in hand or to be found via a held Battle VIP Pass. The actual opt-in `rank11-held-seal-opportunity.cjs` requires a **Tool-free Oranguru V or Crobat V already in play before selecting this route**, and cannot itself open by searching for a missing V with VIP. This is a material access-versus-execution distinction.

A narrower, constructive subset starts with at least one Oranguru/Crobat V **in the initial seven**, chosen Active or placed on Bench. It also requires held Seal, no held Shake, another compatible held Tool for Trubbish, held Trubbish or VIP, and unprized Shake, Garbodor and any VIP-needed Trubbish. The eighth distinguished draw may be any card if two or more Vs were seen; with one V seen, it cannot be the last draw.

| Class | Exact numerator | Conditional rate |
| --- | ---: | ---: |
| Held Seal, V in initial seven | **4,486,654,794,466,293** | **1.384637496%** |
| Broader held-Seal structural access | 10,403,861,960,264,413 | 3.210761254% |
| Additional broad-only source configurations | 5,917,207,165,798,120 | 1.826123758% |

Shared denominator: **324,031,005,021,884,160**. Reproducer: [exact source-locked BigInt census](../../scripts/agent8-rank11-held-seal-v-start-census.cjs), reusing the existing rank11 Prize helper. The 1.3846% subset is still potential access, and putting a starting V in play is an intentional decision. Later voluntary Benching of an eighth-drawn V or generic pre-policy VIP actions may enlarge real policy eligibility. The broad-minus-restricted difference is **not** a measured missed-play rate.

Next collect actual owner-public V-in-play, Tool-free and Trubbish route predicates at the source decision. Validate successful and aborted searches in the native Store. Zero competitive-qualified games.
