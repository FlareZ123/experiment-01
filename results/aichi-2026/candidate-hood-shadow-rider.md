# Hood Shield Shadow Rider v1: a fixed 60-card research challenger

**Agent 15, 16 October 2026.** Status: candidate hypothesis with exact restricted opening mathematics. Neither candidate gameplay nor a field win rate has been validated.

- [Printing-aware 60-card inventory](candidate-hood-shadow-rider.json)
- [Exact nine-card access enumerator](../../scripts/hood-t2-joint.cjs)
- [Regression and exhaustive small-deck test](../../tests/hood-t2-joint.test.cjs)
- [Baseline 60](benchmark-shadow-rider.md)
- [Proven conditional Hood counterlines](hood-vs-thorns.md) and [against Garbotoxin](hood-vs-garbotoxin.md)

## Fixed deck

### Pokémon (18)

| Count | Card |
| ---: | --- |
| 4 | Shadow Rider Calyrex V (CRE 74) |
| 4 | Shadow Rider Calyrex VMAX (CRE 75) |
| 2 | Lillie's Clefairy ex |
| 1 each | Tapu Lele-GX; Trevenant & Dusknoir-GX; Latias ex; Dialga-GX; Mimikyu GRI 58; Girafarig; Marshadow UNB 81; Radiant Eternatus |

### Trainers (31)

| Count | Card |
| ---: | --- |
| 4 each | Mysterious Treasure; Fog Crystal |
| 2 each | Lillie's Determination; VS Seeker; Stealthy Hood UNB 186 |
| 1 each | Iono; Teammates; Raihan; Acerola; Guzma; Pokémon Ranger STS 104; Arven SVI 166 |
| 1 each | Quick Ball; Hisuian Heavy Ball; Battle Compressor; Field Blower; Night Stretcher; Unfair Stamp |
| 1 each | Float Stone; Forest Seal Stone; Sky Field; Dimension Valley |

### Energy (11)

11 Basic Psychic Energy.

The complete machine-readable inventory contains the specific source display sets and collector numbers for every card. Count checks give Pokémon 18, Trainers 31, Energy 11. There are fourteen starting-eligible Basics.

## Difference from champion and from Temple v1

Compared with the [published champion](benchmark-shadow-rider.md), this challenger adds one Shadow Rider V, two Stealthy Hood, one Arven and one Pokémon Ranger. It cuts one Tapu Lele-GX, one Carmine, one Tulip, one VS Seeker and one Sky Field. The fourth VMAX remains in the list, preserving Radiant Eternatus's double-VMAX search ceiling better than [Temple Shadow Rider v1](candidate-temple-shadow-rider.md), which cuts to three VMAX.

Each new card is present in the bundled English database with the stated set/number, and neither Arven nor Stealthy Hood appears in the [dated Japanese ban inventory](../legality/japan-expanded-aichi-2026.json). This is an identity/provenance check, **not** a complete Japanese paper Expanded legality certificate. All 29 published opponent inventories were checked for exact set/number/name/count collisions; none matched this fixed list. The other three opposing 60-card lists remain unavailable.

## Strategic purpose and incurred costs

Stealthy Hood protects a Benched Shadow Rider VMAX's Underworld Door from the opposing Iron Thorns ex Initialization or a live Garbodor Garbotoxin in the previously tested engine states. Those locks are represented by three and four published placements respectively. Arven can search a Tool and an Item, so it can potentially access Hood while obtaining a functional search Item. Ranger potentially clears a resolved Budew attack-origin Item restriction, including when an existing hand cannot play search Items. Each line uses a real Supporter turn; Arven requires a playable Tool target in the deck and Ranger does not clear Vileplume's persistent Ability-based Item lock.

**Costs:** The loss of Carmine hurts immediate draw; removing Tulip weakens Pokémon recovery; losing one VS Seeker reduces Supporter reuse; one Sky Field rather than two reduces persistent eight-Bench support; losing a Tapu Lele-GX reduces Wonder Tag density. Hood occupies the same one-Tool slot as Forest Seal Stone and Float Stone. Opposing Faba, Megaton Blower, Field Blower, and gust to the Active Spot can disassemble or positionally defeat the Hood line. The 11 Basic Psychic Energy still require appropriate attachment sequencing. The list has no Temple of Sinnoh, so it does not pursue Temple v1's Special Energy denial.

## Exact restricted two-turn setup result

Uniform random initial seven, six face-down Prizes, then one normal draw on each of the first two turns. Condition on a starting hand containing at least one Basic. To count as **directly ready**, at least one Shadow Rider V must have been drawn by the end of turn-one draw and one Shadow Rider VMAX by the beginning of turn two. This allows ordinary evolution on turn two, assuming the V was placed on turn one. The *Hood route* additionally requires a Hood in the first nine cards, or an Arven among those nine with at least one Hood still in the deck after all six Prizes are excluded.

| Event, conditional on valid initial seven | Rank-1 champion | Temple v1 | Hood Shield v1 |
| --- | ---: | ---: | ---: |
| Initial seven has a Basic | 86.1409% unconditional | 86.1409% | 86.1409% |
| V by first-turn draw and VMAX by second-turn draw | 18.2573% | 18.3599% | **23.0144%** |
| Same, plus directly drawn Hood | 0% | 0% | **5.4570%** |
| Same, plus direct Hood or Arven's potential Hood search | 0% | 0% | **7.7143%** |

For Hood Shield, the modeled Arven route adds **2.2574 percentage points** of opportunities beyond direct Hood draws. Of all directly ready V-plus-VMAX hands, **33.5196%** have one of these Hood resource routes. With just three V instead of four and the same two-Hood, one-Arven package, the final probability would be **6.0837%**. The fourth V contributes 1.6307 percentage points of this narrow joint opportunity at unchanged fourteen-Basic count.

The computation enumerates multivariate hypergeometric seven-card hands, both ordered turn draws, and the conditional chance all remaining Hoods are Prized. If no Hood has been drawn, the latter probability is `C(6,h)/C(51,h)` for `h` unseen Hoods after the nine draws. The enumeration and independent exhaustive small-deck census are in the linked CJS script and test.

This model **does not simulate actions or win rates**. It omits Fog Crystal, Mysterious Treasure, Forest Seal Stone, Radiant Eternatus's Climactic Gate, draw Supporters, optional opponent-mulligan bonuses, Prize-taking, discard availability, Ability locks, Tool removal, Bench occupancy, and opponent decisions. Assuming Arven is playable is optimistic; omitting its simultaneous Item search is conservative. Consequently 7.7143% is a restricted setup-opportunity statistic, neither a lower nor an upper bound on real protected-board establishment.

## Additional source and engine feasibility checks

The [direct Radiant Eternatus search categorization](../../tests/aichi_hood_radiant_invariance.test.cjs) gives **exactly the champion's restricted six-group composition** `[1 Radiant, 5 direct search Items, 1 Heavy Ball, 4 VMAX, 13 other Basics, 36 other]`. Consequently the source model's after-first-draw route access is unchanged at **52.2048%**, or **50.6594%** with two VMAX remaining in deck. This equality was checked with the existing exact enumerator in [manual CI 38828379343](https://github.com/FlareZ123/experiment-01/actions/runs/38828379343). It is a strictly category-level result. Moving from two Tapu Lele-GX to one and from three Shadow Rider V to four changes card utility within the collapsed other-Basic category; it does not establish unchanged gameplay consistency.

The [source-printing engine feasibility probe](../../simulation/evaluation/aichi-hood-candidate.cjs) passed [manual CI 38828295484](https://github.com/FlareZ123/experiment-01/actions/runs/38828295484): the complete fixed 60-card candidate resolved with the documented research-compatible printing policies, and the pinned engine executed bounded two-seat generic-bot fixtures against source ranks **6 (Iron Thorns)** and **8 (Absol Garbodor)**. There were four synthetic-policy games, with no claim that they demonstrate competent play, complete representative benchmarking, or competitive win percentages. Raw fixture properties and candidate/opponent engine hashes are produced directly by the executable probe.

**Additional independent checks (17 October):** the
[bilateral opponent-mulligan Hood/removal race](hood-response-field.md#bilateral-opening-race-protected-hood-versus-printed-response)
finds a narrowly modeled 8.62% (rank 6/24) or 7.38% (rank 29) protected
resource opportunity with no *directly observed* opposing named Tool
remover in the first nine cards, after accepting all mulligan bonuses.
This is not a working lock or winning game. A separately researched
[Silent Lab Stadium alternative](silent-lab-thorns-response-hypothesis.md)
has a printed-text hypothesis for suppressing Active Basic Iron Thorns
Initialization, balanced by significant Stadium replacement exposure,
Basic-Pokémon self-lock, and a currently unmet pinned-engine test gate.
Both investigations leave the frozen 60-card candidate unchanged.

## Next validation gates
The [adversarial Arven-to-Hood effect test](hood-arven-interaction.md) passed [CI 38829270890](https://github.com/FlareZ123/experiment-01/actions/runs/38829270890): under opposing Initialization, the correctly chosen Hood survives V-to-VMAX evolution and exposes Underworld Door. Opposing Faba or hooked Megaton Blower can immediately remove it, suppressing the Ability again. The default SimpleTacticsAi's Arven search independently selected `Fog Crystal + Float Stone` in that state, confirming a concrete policy gap. A [source-complete Tool-removal audit](hood-response-field.md), with [deterministic CI 38829259172](https://github.com/FlareZ123/experiment-01/actions/runs/38829259172), finds at least one named hard Tool answer in **20/29** published source lists, including all three Iron Thorns lists. These counters constrain the deck's matchup promise. Both results concern resources and isolated effects; a real game win-rate is still unmeasured.


1. Run the deterministic `tests/hood-t2-joint.test.cjs` on Node 20 or later and record the results. The exact values were independently cross-checked in Python; the committed Node regressions and dated banlist checks passed [manual GitHub Actions run 38827475499](https://github.com/FlareZ123/experiment-01/actions/runs/38827475499).
2. Confirm, in the pinned engine, that attached Hood survives V-to-VMAX evolution and still blocks Initialization and Garbotoxin. The [research fixture](../../simulation/twinleaf/hood-through-evolution.cjs) exists; verify its CI outcome before treating it as passing.
3. Test a realistic Arven-to-Hood-plus-Mysterious-Treasure turn with one discard cost, correct one-Supporter constraint, a Bench slot, and both seats.
4. Evaluate this exact list against all 29 available source opponents and keep the three missing lists explicit. Require equally competent opponent policies, actual first-turn evidence, proper raw records, and replayable failure cases before comparing game strength.

**Decision:** preserve Hood Shield as a falsifiable counterline candidate alongside Temple v1 and the champion reference. Its structural protection is mechanistically motivated, while the unmodeled consistency costs and anti-Hood counterplay prevent evidence-based promotion to the strongest deck.


## Japanese Extra paper-printing qualification (12 November 2026)

The candidate's exact 60 now has a Japanese-language print crosswalk for the Aichi Open League's Japanese Extra rules. The fixed card identities and counts are unchanged. See the complete [Japanese Extra paper-print manifest](2026-11/agent14-hood-shadow-rider-japanese-extra-paper-print-manifest-20261112.md) and [machine-readable crosswalk](2026-11/agent14-hood-shadow-rider-japanese-extra-paper-print-manifest-20261112.json).

The only required physical-print correction is the English proxy Basic Psychic Energy MEE 013: it is a post-event 30th Celebration printing. Use any Japanese Basic Psychic Energy printing released by 10 May 2026 instead. The manifest also distinguishes the candidate's legal Resetting Hole Marshadow from the specifically banned SM3+ Let Loose Marshadow.

This is a printing and banned-list qualification only. No physical deck was inspected, no game was played, and the candidate remains unselected pending competent field evidence.


## Opening-hand structural comparison

A reproducible seven-card hypergeometric comparison against the official Aichi champion reference is available in [the opening-hand report](2026-11/agent14-hood-opening-hand-profile-20261112.md) and [its standard-library script](2026-11/agent14-hood-opening-hand-profile-20261112.py). The candidate keeps the same 14 Basics, 11 Psychic Energy, 9 Supporters and 9 direct V-search items, but moves one slot from Tapu Lele-GX to Shadow Rider V. This raises raw opening V probability from 31.54% to 39.95% and V-plus-Energy probability from 23.16% to 29.46%, while reducing raw Tapu Lele-GX access. These are structural probabilities only, not evidence of matchup strength.


## V3 Underworld Door hook source-manifest audit

The existing Agent36 V3 fixture runner already includes the research-owned Underworld Door hook as a `sharedEnginePatch`, hashes it into the role-entry manifest, installs it before role composition, restores it in `finally`, and records a runtime patch receipt. See the [source-manifest audit](2026-11/agent14-v3-underworld-hook-manifest-audit-20261112.md). No duplicate hook or manifest patch is needed.

This is source-level inclusion only. The fixture has not been executed; the checked-in dispatch marker requires manual workflow dispatch. It is a one-seed, fixture-only baseline with no independent reviewers and explicitly does not apply candidate Hood options or recovery autonomy. It is not a competitive evaluation.


## Agent50 structural slot challenger — 13 November 2026

A separate slot audit found that the v1 list retains one Dialga-GX UPR 100 despite containing only 11 Basic Psychic Energy and no Metal Energy. The card-pool entry is Dragon-type with no Ability; all three attacks require at least one Metal Energy. It can still serve as a searchable 180-HP Basic body (Mysterious Treasure can search Dragon Pokémon), so its intended pivot/discard role is not ruled out.

Agent50 registered an untested v2 challenger replacing that one Dialga-GX with a second Tapu Lele-GX. This preserves the 60-card count, 14 Basics and all Shadow Rider/Hood setup counts, while adding a second Wonder Tag and four additional no-discard Fog Crystal search outs. Exact raw direct-draw probabilities and the 10-HP/Ability-lock tradeoffs are documented in the [slot audit](2026-11/agent50-hood-shadow-rider-dialga-slot-audit-20261113.md); the complete alternative list is [Hood Shield Shadow Rider v2](candidate-hood-shadow-rider-v2.md).

**Status:** v1 remains the nominated leading modified-list hypothesis. v2 is only a structural challenger; no paired games or matchup advantage have been demonstrated. Do not replace the nomination without matched full-game evidence.
