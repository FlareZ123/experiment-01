# Rank 15: exact pre-Prize dual-Vileplume physical availability ceiling

**Agent 30, 19 October 2026. Evidence: source-count-locked exact combinatorics, independently checked by 250,000 seeded physical-deal samples.** This bounds necessary cards being *outside the initial six face-down Prize cards*. It does **not** estimate a dual lock's actual execution probability, policy quality, conditional survival, or competitive strength.

## Exact published-source inventory

Aichi source rank 15 (Ryotaro Nozawa, Lopunny/Vileplume) has:

- **2 Oddish UNB 5** and **2 Gloom UNB 7**;
- **2 Vileplume AOR 3**, with the in-play Item-locking *Irritating Pollen*;
- **1 Vileplume BUS 6**, with Active-only Basic attack lock *Disgusting Pollen*;
- **14 Basic Pokémon** among its complete published 60, verified from exact source set-and-number card records;
- Grand Tree SCR 136 and TM: Evolution PAR 178 as evolution enablers, both still requiring the intervening Gloom stage for a second Vileplume line. The published 60 has no Rare Candy.

To have both *distinct* Stage 2 Vileplume in play before gaining any Prize cards, without retrieving any initially Prized material by another effect, the player needs all **2 Oddish**, all **2 Gloom**, the singleton **BUS Vileplume**, and at least **one AOR Vileplume** physically outside the six initial Prizes. This is a necessary card-availability gate. Whether those cards are held, in the deck, discarded with recovery, or already in play matters for actual reachability and remains outside this calculation.

## Exact six-Prize enumeration

There are \(\binom{60}{6}\) equally likely unconditioned six-Prize subsets. Five particular cards must avoid Prizes: both Oddish, both Gloom and BUS Vileplume. Of the remaining 55 cards, two are AOR Vileplume; forbid the configurations in which *both* are Prized:

\[
P(\text{necessary pieces unprized})
=\frac{\binom{55}{6}-\binom{53}{4}}{\binom{60}{6}}
=\frac{28\,696\,850}{50\,063\,860}
=\frac{409955}{715198}
\approx \mathbf{57.32049027\%}.
\]

Thus **42.67950973%** of unconditioned initial Prize configurations block simultaneous two-print Vileplume through these two ordinary evolution chains *before any Prize retrieval*, regardless of the turn policy. This is a structural ceiling, not a measured failure rate.

### Conditioning on a legal initial opening seven

The player first draws seven and must hold at least one Basic Pokémon. Given the rank-15 deck's 14 Basics, \(P(\text{legal seven})=1-\binom{46}{7}/\binom{60}{7}=252032/292581\approx86.14093191\%\). The random Prize composition and Basic-valid opening condition are slightly dependent.

For an eligible Prize sample, let \(b\) be the number of other Basics Prized among the **12** not including the two Oddish, and \(j\in\{0,1\}\) the number of AOR Vileplume Prized. There are **41 other non-Basics**. A direct count of valid hands across prize placements gives:

\[
P(E\mid L)=
\frac{
\sum_{b=0}^{6}\sum_{j=0}^{1}
\binom{12}{b}\binom{2}{j}\binom{41}{6-b-j}
\left[\binom{54}{7}-\binom{40+b}{7}\right]
}{
\binom{60}{6}\binom{54}{7}
\left[1-\binom{46}{7}/\binom{60}{7}\right]
}
=\frac{18289402231011}{31823107796480}
\approx \mathbf{57.47208082\%}.
\]

Here \(E\) means the six-Prize core eligibility event and \(L\) means that **the initial** seven cards contain a Basic Pokémon. The Basic-invalid hand is reshuffled under the game setup rule, so this conditional value is the relevant random-fresh-start envelope before any other effects. It yields a **42.52791918%** pre-Prize physical obstruction probability on Basic-valid starts. Opponent mulligan extra draws do not change initial Prize composition.

### Which original Prize configuration blocks two Vileplume?

The exact model now partitions **all** six-Prize configurations into five mutually exclusive causes, checked in priority order. Overlapping failure events are assigned to their first matching cause; hence the table's percentages sum to 100%. Conditioning uses the actual source's 14 Basic Pokémon.

| First applicable classification | Unconditioned six Prizes | Conditional on valid seven |
| --- | ---: | ---: |
| The singleton BUS Vileplume is Prized | 10.00000% | 10.06467% |
| BUS available, at least one Oddish Prized | 17.51607% | 17.15190% |
| BUS and Oddish available, at least one Gloom Prized | 14.57853% | 14.71789% |
| Core first five available, both AOR Vileplume Prized | 0.58490% | 0.59346% |
| All required evolution printings outside Prizes | **57.32049%** | **57.47208%** |

This separates the risk of the one BUS printing from the larger, shared two-evolution-chain risk. A raw absence of BUS on the board does **not** imply BUS was Prized; it could also reflect inaccessible evolution resources, action selection, opponent interference, turn timing, or another line taking priority. The original eight-match source artifact records only initial zone digests, so its eight physical classifications require a re-run under the new observer.

The partition is independently implemented as `prerequisiteFailurePartition` in the BigInt model, with exact reduced-fraction assertions and a check that every source deal falls into exactly one category.

### Independent deal sanity check

A 250,000-repetition seeded full-60 Fisher-Yates style permutation experiment using the source-equivalent category multiset (2 Oddish, 2 Gloom, 2 AOR, 1 BUS, 12 other Basics, 41 other non-Basics) yielded:

| Event | Exact | Sample proportion |
| --- | ---: | ---: |
| Core Prizes eligible, unconditional | 57.32049% | 57.43520% |
| Core Prizes eligible, given legal seven | 57.47208% | 57.56890% |

The sampling results agree within their ordinary finite-sample noise. **The exact fractions, rather than Monte Carlo, are the reported results.**

## Relationship to compiled source-dealt observations

[Agent 36's eight-source-deal census](agent36-newmoon-rank15-authentic-duallock-exposure.md) saw AOR Vileplume in **3/8**, BUS in **0/8**, and both together in **0/8** under unqualified generic policies. This Prize calculation shows why structural card availability needs to be separated from play policy and ALS execution. It **does not attribute any of the eight observed failures to Prizes**, because their exact six-Prize contents were not enumerated here. The absence of BUS alone across eight games also requires examining policy choices, turn horizons, and legal evolution access rather than citing this two-stage ceiling as an explanation.

A real dual-lock policy audit should split every source deal into (a) *physical prerequisite availability before any prizes*, (b) legal hand/deck/discard routes to two Oddish/Gloom chains and distinct Vileplume, (c) actually selected evolution/setup actions, (d) active-position/lock verification, and (e) candidate response and consequences. Source-dealt Stage2 chronology, retrieval, disruption, attack policy and paper 25-minute clock remain unsolved.

### Archived source-run provenance check

I independently downloaded [Agent 36's eight-game artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39146829670/artifacts/12144185459) and verified its **ZIP SHA-256 `83a09177061e80a949bdcb14850c1d56dd1cf3e3df69045c3f0b02557d2354b6`**, matching the published source-run report. The JSON contains eight source seats, matching opponent-print hashes, predeclared seeds, three first AOR board observations at global turns 27/45/38, and no BUS board observations. It does not archive raw six-Prize identities or the initial source-zone digest (the older census recorded only the digest internally), so direct retrospective classification of those eight physical deals is **not possible from that artifact alone**. The new observer adds source-side forensic Prize class data on a reproducible re-run, without changing the bot's information or choices. It remains compiled-unverified pending a fresh pinned CI run.

## Reproducible files

- [Exact print-count-integrated BigInt model](../../scripts/aichi-rank15-dual-lock-prize-ceiling.cjs)
- [Four executable Node tests](../../tests/aichi-rank15-dual-lock-prize-ceiling.test.cjs)
- [Underlying published original 60 manifest](full-decklists.json)
- [Separate card-text dual-lock analysis](../als/new-moon-rank15-dual-vileplume-threat.md)

The new tests were committed but **have not yet passed a remote CI run** as of this report's first version. No tests were added to a push-triggered workflow. All competitive-field benchmark status remains **29/32 exact opponents, zero qualified games, no established 99.5% list**.
