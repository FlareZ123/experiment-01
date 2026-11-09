# Super Growth Sentinel: one-attack Vileplume lock and hybrid first-turn resource screen

**Agent 10 | 9 November 2026 | complete fixed printed 60-card candidates, 1,000,000 independent shuffles per list, 11 locally and GitHub-CI-passing deterministic regressions.** There are **zero competitive qualified games**, no natural-terminal native games with these challenger lists, and no estimated matchup win probability.

## Decision and useful invention

A previously untested Sentinel structural alternative puts **Rowlet & Alolan Exeggutor-GX (UNM 1)** into the existing 60. Its **zero-Energy Super Growth** attack can immediately evolve a Grass-type Oddish on the Bench through Gloom into Vileplume AOR. This removes the need to use Bunnelby PRC's Omega Barrage to attack with Technical Machine: Evolution twice when the new path is established. The provided Advanced Player's Rulebook C-12 explicitly allows attack-effect Evolution on the first turn or the turn a Basic entered play, unless an exception is printed.

**The preferred structural challenger for next native testing** is a hybrid, [one Rowlet & Alolan Exeggutor-GX and one Technical Machine: Evolution](../candidate-hybrid-supergrowth-sentinel-v1.psv), relative to the unchanged [Sentinel baseline](../candidate-sentinel-lopunny-vileplume-v1.psv) with two Technical Machine: Evolution and zero Rowlet. It preserves both first-turn lines. The [alternative two-Rowlet list](../candidate-supergrowth-sentinel-v0.psv) swaps both TM copies and is retained as an independent comparison. Both files retain the full original 60-card inventory except for the stated slots, have exactly 60 card copies and unique four-copy-compatible counts.

The **complete conditional source-consistent Super Growth line** when the necessary physical cards remain available:

1. Initial 7 has a playable Basic Active, held **Tag Call**, and at least two expendable cards; source deck retains TAG TEAM Rowlet, Guzma & Hala, Artazon, Jet Energy, Oddish, Gloom and Vileplume.
2. Play actual Tag Call to take **Rowlet & Alolan Exeggutor-GX plus Guzma & Hala** from own deck. Put Rowlet on Bench and play G&H, discarding two other held cards to search **Artazon (Stadium)** and **Jet Energy (Special Energy)**. There is no Tool needed by this new route.
3. Play Artazon, search Oddish onto Bench, then attach Jet Energy to Benched Rowlet. Jet switches Rowlet into Active and leaves its zero-Energy attack payable.
4. Declare Super Growth and evolve the Benched Grass Oddish directly into Gloom and then Vileplume, searching each Stage from the same real deck. Vileplume's Irritating Pollen Item lock is then in play for the opponent's next turn.

When Rowlet is starting Active and an Oddish is already held, both G&H and Jet may be unnecessary. When Bunnelby starts and the single TM is accessible, the original double-Evolution plan remains an alternative. Exact native chain, source print legitimacy, attack completion and Item-lock settlement are the next decisive tests. A held-card Tag Call additionally consumes a deck card and requires the actual physical remaining search targets, so neither ability nor search access is treated as free.

## Reproducible original sixty-card first-turn experiment

[Source-screen script](../../../scripts/agent10-super-growth-first-turn.cjs), [hybrid script](../../../scripts/agent10-hybrid-supergrowth-first-turn.cjs), [7 original-route tests](../../../tests/agent10-super-growth-first-turn.test.cjs), [4 hybrid tests](../../../tests/agent10-hybrid-supergrowth-first-turn.test.cjs).

Each arm independently performs one million deterministic Fisher–Yates shuffles of **its actual 60-card PSV count inventory** using fixed seeds 20261109 (source), 20261110 (two-Rowlet), 20261111 (hybrid). Among initial sevens containing at least one legally designated Basic, it selects the starting Active before seeing the six Prize cards. It then deals six hidden Prizes, exposes the single normal first-turn going-second draw and checks hand/remaining-deck prerequisites for each route. It requires actual searchable Oddish, Gloom and Vileplume copies still in the deck, one accessible Tag Call/Hala line, the one Stadium, Jet or another already held affordable attachment as applicable, and a two-card remaining physical discard capacity when G&H's optional Tool/Special-Energy package is needed. It counts the first successful route only, with one frozen physical opening and Active per hybrid trial.

| Fixed original 60 | Valid initial sevens / 1M permutations | Restricted physically accessible first-turn Vileplume line among legal openings | Wilson 95% Monte Carlo interval | Route count |
|---|---:|---:|---:|---|
| Source two-TM Sentinel | 861,439 | **27.94208%** | 27.84743–28.03694% | 240,704 Omega Barrage + TM |
| Two-Rowlet no-TM v0 | 900,298 | **44.57780%** | 44.47515–44.68049% | 401,333 Super Growth |
| Hybrid one Rowlet + one TM v1 | 882,615 | **47.07670%** | 46.97258–47.18084% | 327,369 Super Growth; 88,137 TM fallback |

**Observed access difference** under this restricted model: hybrid over two-TM baseline **+19.13462 percentage points** and hybrid over two-Rowlet **+2.49890 percentage points**. These are fractions of legal opening opportunities under a favorable and explicitly restricted plan. The three printed sixties are different and independently shuffled; identical RNG seed notation would never imply a physically paired opening. The reported Wilson intervals represent Monte Carlo sampling error conditional on this simplifying model; they do not capture strategic/game uncertainty or provide win-rate confidence intervals.

The 11 tests exercise the exact replacement, frozen opening Active, actual 60 physical card custody and Stage cards in deck, two-card discard feasibility, both favorable branches, and independent deterministic repeatability. [Pinned automatic manual CI success: 42543432550](https://github.com/FlareZ123/experiment-01/actions/runs/42543432550) tested the original seven. [Combined 11-regression and million-per-arm CI: 42544053610](https://github.com/FlareZ123/experiment-01/actions/runs/42544053610) completed successfully and archives both machine-readable JSON experiment summaries.

## Why this does not qualify a competitive result

- **Paper viability and fidelity:** Super Growth's printed evolution effect and zero Energy cost are genuine. The complete Japanese historical-print/Extra legality of all 60 positions and any eratta still need audit; the PSV uses an English UNM 1 proxy for the Japanese Sky Legend TAG TEAM. No Store simulation has yet tested this candidate's real prompt chain, first-turn evolution or Vileplume Ability lock.
- **The 3-Prize liability is central:** the 270-HP Rowlet TAG TEAM awards **three Prize cards** when Knocked Out, has **three Colorless retreat**, and is weak to Fire. Its unusually efficient first-turn lock may expose an expensive Active target. Against Aichi rank-1 Shadow Rider, a prior real conditional native [Guzma/VMAX counterreply](agent28-sentinel-rank1-guzma-counterreply-native-20261108.md) already established that Item lock alone does not preclude Supporter gust. The new Rowlet front line needs equally serious reply testing and a position plan.
- **Simulator bias:** the screen assumes useful cards are all playable in ideal order, leaves out alternate early draw, subsequent search, prize recovery, opponent mulligan draws, full Bench content and prior uses of Supporters, restrictions from the opponent, opponent policy and 25-minute clock. G&H's theoretical two discards are treated as available if the hand has two unreserved cards; real DCI/UDP can make this line worse. The baseline may have other first-turn routes omitted by this screen. The hybrid union is likewise a resource reachability upper-style screen rather than demonstrated winning access.
- **Scope:** No actual full paper game, no all-32 source evaluation, no source-original bot competence audit and no practical win-rate measurement. The 99.5% overall objective remains entirely unestablished.

**Action priority:** native two-seat first-turn Source/HYBRID scripted real-Store transition with unique printed cards and paid Tag Call/G&H/Artazon/Jet/Super Growth choices; preserve owner custody and post-attack Item-lock action. Then immediately test the strongest opponent counterreply instead of treating early lock establishment as an automatic match win. Preserve the unchanged 60 in this file and conduct a new-seed source-field prospective native comparison only after native contract tests pass.
