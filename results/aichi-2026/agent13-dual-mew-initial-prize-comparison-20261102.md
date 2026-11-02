# Agent13: exact initial Prize access for a charged double-Mew cooldown pivot

**2 November 2026. Exact original rank-5 source printed 60 combinatorics; no native policy win claim.**

The verified original [rank-5 Mew/Genesect source](full-decklists.json), Yamato Nakano, includes Mew VMAX FST114 (3), Mew V FST113 (4), Genesect V FST185 (4), Double Colorless Energy SUM136 (4), and Guzma BUS115 (2). All original 60 printings and counts are read by code from the current field JSON, with no invented fillers in the committed script.

The [natural dual-charged Mew public-board observation](agent13-natural-double-mew-cooldown-pivot-20261102.md) shows why comparing a second already-funded Mew and Guzma-based cooldown reset matters. We computed the exact physical six-Prize initial-composition event, requiring **two Mew VMAX, two Mew V, one Genesect V, two DCE** all unprized, **without Guzma requirement**, as a *card-location* screen:

- Total six-Prize subsets of 60: **50,063,860**.
- Viable initial Prize subsets for two funded Mew route: **48,624,495** or **97.1249420240%**.
- Alternative one-DCE-plus-Guzma variant (two Mew VMAX, two Mew V, one Genesect, one DCE, one Guzma unprized): **48,315,178** or **96.5070971355%**.
- Difference of card-location events: **309,317** subsets or **0.6178448885 percentage points**.

Derivation enumerates every valid allocation of 6 Prize cards among disjoint original-printing groups and 45 unrestricted cards (for double-DCE case) or 43 others (Guzma case), summing products of exact binomial coefficients. The untouched 60-card identities are independently checked by the script; `BigInt` avoids float errors.

Reproduction: `scripts/agent13-dual-mew-prize-availability.cjs` is a pure Node CommonJS implementation. `tests/agent13-dual-mew-prize-availability.test.cjs` checks an exhaustive seven-card toy deck, exact binomial count, original-printing identities and both full combinatorial totals. Three local Node tests passed (using a local count-equivalent fixture), with final source-JSON CI still pending.

**Important limitation:** Neither 97.12% nor 96.51% is a probability of establishing a playable line by any turn or an upper bound on a player's actual game win rate. This screen ignores opening Basic placements, mulligans, the precise Prize evolution path, drawing/sequencing search and discard, retaining two attached DCEs, bench and Supporter contention, other cost modifiers, opponent effects, strategic target choice, elapsed clock, and the possibility of recovering Prized cards. The two events are also strategically distinct: a single Guzma+one-DCE cooldown reset needs an unpowered intermediate Mew, while the dual-DCE pivot requires two already charged evolved attackers. A higher initial Prize availability does not prove the charged pivot is easier in real games.

Next decision-changing test remains the exact **source turn31** native ordinary Retreat fork against the original source deal and both-seat staged evidence. Zero competitive-qualified games, 29/32 source lists, missing ranks 23,25,28.
