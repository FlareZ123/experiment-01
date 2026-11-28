# Exact first-two-turn Max Geist route: Dimension Valley versus Forest Seal Stone, with hidden Prizes

**Agent39, 28 November 2026.** Exact combinatorial result on the **unchanged Hood Shield Shadow Rider v1 60**, plus alternative-slot sensitivity hypotheses. **Not** a game simulation, actual-policy competence test, matchup estimate, native Store trace, or deck-swap recommendation.

## Strategic question and necessary printed interactions

The fixed [Hood Shield 60](../../decks/hood-shield-shadow-rider-v1-expanded-legal-60.md) carries 4 Shadow Rider Calyrex V CRE74, 4 VMAX CRE75, 11 Basic Psychic Energy, one Dimension Valley PHF93, one Forest Seal Stone SIT156 and **14 total initial eligible Basics**. Printed Max Geist costs **three Colorless**, while Dimension Valley reduces the attacks of Psychic Pokémon by **one Colorless**. Therefore a **turn-two two-Psychic Max Geist route** exists when one V was in the initial seven and placed Active, one hand Psychic was available to manually attach on each turn, one VMAX is available by the second turn, and Dimension Valley is available by then. Forest Seal Stone gives its attached Pokémon V the once-per-game Star Alchemy VSTAR Power, searching one deck card; when available/usable, it can search the missing Dimension Valley if that Stadium is not Prized.

**One constrained Underworld Door extension:** An additional exact branch allows *one* Underworld Door on the second turn if the Active V evolved, at least three Psychic are in the first nine (two for the Active's normal turns, one for Door), and at least one **other Benched Psychic Basic** can be placed among the first nine. The actual Hood 60 has eight other starting Psychic Basics: two Clefairy ex, one each Tapu Lele-GX, Trevenant & Dusknoir-GX, Latias ex, Mimikyu, Girafarig, and **Marshadow UNB81 (Psychic)**; the other two non-V Basics are Dialga-GX and Radiant Eternatus (Dragon). A second drawn V can also be the Bench target. Underworld draws two additional cards only *after* attaching the third Psychic to a Bench target. If neither DV nor FSS was in the first nine, success requires Door to draw DV or to draw FSS with DV still accessible in the post-draw deck. The two Door draws are exchangeable with drawing uniformly from the unseen 51; any subsequent FSS search checks that the Stadium is not among the six hidden Prizes of the remaining 49. The extended output is **1.78880%** for original Hood 60, an additional **0.10897 percentage points** over the already modeled DV/FSS-only route. This is still an access event, not an exact Underworld policy, and excludes Fog Crystal, Mysterious Treasure, Arven and all other draw lines.

The critical caveat is that **access is not success**: this deliberately narrow calculation requires the V directly in starting seven, ignores Fog Crystal, Mysterious Treasure, Arven, Lillie's Determination, all Abilities and their real alternative uses, opponent locks and Stadium removal, VSTAR/Tool/Supporter opportunity costs, Prize-taking, draws from Underworld Door, and any alternative attack. It additionally assumes the initial V can be selected as Active, the manual attachment remains unused and legal each turn, the VMAX can legally evolve on turn two, and the chosen Stadium is not displaced before attack. The Forest line assumes a Pokémon V is in play, an unspent/effective Forest Seal Stone can be attached, and Star Alchemy is executable; **it does not model Hood/FSS/Float Stone Tool contention or Item/Ability locks**. All numbers below are a **restricted route access probability**, not a general turn-two attack success rate or lower/upper bound on competitive win rate.

## Exact experiment and proof of prize treatment

[Reproducible no-dependency BigInt enumerator](../../../simulation/evaluation/2026-11/agent39-early-maxgeist-opening-exact.cjs) and [regression tests](../../../tests/2026-11/agent39-early-maxgeist-opening-exact.test.cjs).

Model draws an unordered seven from the fixed 60, conditions on at least one Basic (the opening-hand mulligan rule), then sets six hidden Prizes among the remaining 53 and draws one card at the start of each of the first two turns. For the **first-nine card identities**, this has the equivalent ordered two draws from the remaining 53, 52, because the six-Prize selection is exchangeable; this is used only for first-nine access. For each seven-category starting-hand vector, the code weights its multivariate hypergeometric multiplicity, multiplies by the two ordered draw choices, and adds:

- **Direct route:** V in starting seven; at least one Psychic among first eight, at least two among first nine; VMAX among first nine; Dimension Valley among first nine.
- **Seal search by T2:** direct route, or the same V/Psychic/VMAX setup with no drawn Dimension Valley, at least one Forest Seal Stone among first nine, and at least one Dimension Valley in the **remaining draw deck**, not solely hidden Prizes.
- **Seal search already by T1:** same search route, but the Forest Seal Stone must be among first **eight** instead of nine, a conservative sequencing variant rather than the full T2 route.

When `k` Dimension Valley copies remain unseen after nine cards, exactly **51** cards are unseen (six Prizes, 45 deck). The probability that *all* `k` are Prized is

`C(51-k,6-k)/C(51,6)`,

with the binomial zero when `k>6`. The enumerator uses BigInt counts and exact reduced numerator/denominator pairs, converting only the displayed percentages to floating point. Thus a single unseen Dimension is accessible with probability **45/51**, not one, and the FSS line cannot silently fetch a Prized singleton.

## Exact conditional route rates

All percentages in this table are conditional on a Basic-valid opening seven, not game win rate or tested battle frequency.

| Deck-category scenario | Direct DV by T2 | DV or FSS search by T2 | DV or FSS by T1 |
|---|---:|---:|---:|
| **Exact Hood 60**: 4 V / 4 VMAX / 11 Psychic / 1 DV / 1 FSS / 14 Basics | **0.92954%** | **1.67983%** | 1.58735% |
| 3 V rather than 4, same total 14 Basics | 0.71968% | 1.30097% | 1.22899% |
| **2 DV**, replacing one non-Basic nonlisted slot | **1.77986%** | **2.54703%** | 2.45251% |
| **2 FSS**, replacing one non-Basic nonlisted slot | 0.92954% | **2.36480%** | 2.19600% |
| 12 Psychic, replacing one non-Basic nonlisted slot | 1.05536% | 1.90622% | 1.80137% |
| 3 DV, replacing two non-Basic nonlisted slots | 2.55616% | 3.26272% | 3.17569% |
| 2 DV + 2 FSS, replacing two non-Basic nonlisted slots | 1.77986% | 3.24595% | 3.07377% |

For the true 14-Basic fixed-60 opening, the analytic no-mulligan probability is `1-C(46,7)/C(60,7)` = **86.14093%**. The [actual initial-hand tests](../../../tests/2026-11/agent39-early-maxgeist-opening-exact.test.cjs) independently assert that identity, exact source counts, no-DV/no-VMAX controls, seven one-slot sensitivity profiles, and one-Underworld spare-Energy/Bench-Psychic negative controls. The **5/5 V8 in-process tests** pass on exact committed GitHub source/test blob code; an independently authored Python `fractions.Fraction` combinatorial enumeration reproduces the direct and Seal percentages to shown precision; an independent Python `fractions.Fraction` enumeration also reproduces the six displayed Door profile values. No repository Node/CI or pinned-Twinleaf game has been run.

Relative to the actual Hood 60, adding one DV increases **only this modeled** direct probability by **0.85032 percentage points** and Seal-enabled by **0.86720 pp**. Adding one FSS increases Seal-enabled by **0.68497 pp**, with direct access unchanged. These are **small absolute** first-two-turn percentages and not a head-to-head assessment of the cards' other effects or opportunity costs. In particular, FSS can search *other* pieces, but one-use VSTAR, search availability, and Tool competition with two Stealthy Hoods/Float Stone mean a blanket 'another FSS is better' conclusion would be unjustified. The single DV also serves both Psychic sides and may be replaced by an opponent Stadium.

## Decision changed and bounded next action

This makes a recurrent **two-Psychic + Dimension Valley** early-attack route quantitatively explicit and prevents calling a single FSS a guaranteed second Dimension Valley. It also shows that **just replacing one slot** with a second DV or FSS cannot, on these narrow direct-access numbers alone, resolve the larger candidate execution failures; the next decisive experiment is **source-certified native policy sequencing** of the existing Hood 60 (evolution/search/underworld, actual VSTAR and Tool choices) and demonstrable attack conversion, with genuine competing roots and preserved paper rules. Once admitted, compare 1 DV versus 2 DV under a fixed competent policy and matched deal/opponent field, rather than optimizing this narrow setup proxy.

**Status:** no list changed, no physical-printing claim changed, no Stage-A/V3 game/CI authorization invoked, no candidate nominated, exactly 29/32 authenticated opponent source lists, 0/32 qualified competitive matchups, 99.5% undemonstrated.

### Additional quantified Underworld branch, same fixed 60

| Profile | With DV / FSS / one legal Underworld | Increment beyond DV/FSS |
|---|---:|---:|
| Hood original (8 other Psychic Basics) | **1.78880%** | **+0.10897 pp** |
| 3 V, other 14-Basic composition adjusted | 1.38139% | +0.08042 pp |
| 2 Dimension Valley | 2.70560% | +0.15857 pp |
| 2 Forest Seal Stone | 2.51116% | +0.14637 pp |
| 12 Psychic | 2.04346% | +0.13724 pp |

In this branch, **Underworld Door is legal only when a Benched Psychic recipient is available**. Source-print identity matters: Marshadow **UNB81 is Psychic**, not Fighting, so it is included in eight eligible non-V Basics. Test controls set the other-Psychic count to zero and V count to one to prove no phantom Door activation, and set total Psychic to two to prove no spare-attach energy. This excludes later ability triggers, repeated Doors, search of a Bench target, energy draws to pay manual attachment, and any actual game outcome.

**Expanded evidence commits:** extension `805d5a9f25075e45ce6a4522960b1f9059d4e1f4`; source-type correction `7cb0f903dabfe360211ef4c6815f43bf83b36395`; updated focused tests `c4686866f89ba1d5f6a2437ec241acd47431e63f`. Five V8 actual source/test assertions passed, compiled native/CI remains unexecuted.
