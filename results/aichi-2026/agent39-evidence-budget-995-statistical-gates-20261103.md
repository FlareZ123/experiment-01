# Agent39: exact idealized statistical evidence budget for a 99.5% Aichi-field game-win claim

**3 November 2026. Mathematical planning bound, not observed performance.** No new game data and no opponent source-60 authentication. This note is solely about how much *already-qualified independent* evidence a fixed policy could require; every existing project-native developmental game remains unqualified.

## Declared estimand and model

Let `p_i` be the probability of a **game win** by one prespecified **unchanged** 60-card list against an independently competent policy for original rank `i` (32 distinct ranks), under a declared fixed mixture of starting seats, rules, adjudication and source randomness. Assume independent Bernoulli game trials within and across opponent ranks, identically distributed within each rank. For this calculation only, declare equal field weights `w_i=1/32` and target `p_bar=(p_1+...+p_32)/32 >= 0.995`.

These assumptions are **not established by existing Twinleaf experiments**. Repeated actions inside games, variants selected after inspecting outcomes, identical-source replays without independent random draws, source-mulligan mismatches, censored games, engine-invalid actions, opponent hidden-state reads, weak bots, unsupported card effects or a missing source 60 defeat the proposed evidence model. Paper fidelity, all 32 authenticated source lists, both-seat competency and official-clock outcomes are prerequisites.

## Two different claim levels

1. **Equal-weight field aggregate only.** If exactly `n` independent games are preassigned to each source rank and **all 32n games are wins**, then for any null vector with mean `p_bar <= 0.995`, the all-win probability is bounded by the arithmetic-geometric mean inequality:
   `P(all wins)=product_i p_i^n <= (p_bar)^(32n) <= 0.995^(32n)`.
   A one-sided 5% exact all-win rejection requires `32n >= ceil(log(0.05)/log(0.995))=598`. Balanced allocations therefore require at least **19 per rank, 608 total**, with **zero failures**, under the stated independent/frozen-plan assumptions. At 608/608 wins the one-sided aggregate lower bound under the balanced plan is `0.05^(1/608)=0.9950849274554779`. This proves only a field **average** threshold in the idealized model; individual matchups can still be substantially weaker.

2. **Every one of 32 matchups individually at least 99.5%, familywise 95% confidence.** A conservative simultaneous one-sided Clopper-Pearson/Bonferroni guarantee requires the all-win lower bound in each rank to reach 0.995 at per-rank alpha `0.05/32`. Thus `n >= ceil(log(0.05/32)/log(0.995))=1,290` **independent wins per opponent**, or **41,280 all-win games**. Any loss changes the exact lower bound and requires a larger per-rank sample for this particular guarantee. This is much stronger than the project's expressly defined fixed-deck full-field **aggregate** objective and is offered to prevent ambiguous confidence claims.

The numbers are direct numerical evaluations of the displayed logarithms. The 19-per-rank aggregate protocol is an **extreme no-loss threshold**, not a recommendation to launch 608 expensive native games now. A handful of credible adverse games can be more decision-informative early. In particular, a policy that cannot achieve paper-legal first turns or a consequential reply has not reached the stage where this formula applies.

## Admission protocol before any confidence computation

Freeze one exact candidate 60, exact original opposing 60 for each rank, opponent policy revision, starting-seat mixture, approved card pool and patch/hook hashes, simulator and research commit, seeds, action bounds, wall clock and disqualification rules. Preregister the whole 32-rank panel and its weighting. Independently establish actual source physical-deal validity and original owner-hand/printed-rules compliance. Accept only finished qualified games; account for ties and incomplete games under a predefined rule. Log every attempt with aborted/censored/rejected counts, and never silently discard bad results.

A successful pure/native compile test contributes **zero** Bernoulli game observations. A correct physical prompt receipt contributes a mechanism validation, and its multiple occurrences in the same match contribute **zero** independent games. Conditioning an experiment on a source opportunity or starting hand requires a separately declared estimand.

Repeated policy tuning, opponent-policy iteration, candidate selection or picking the best seeds breaks naive frozen-plan significance. A separate holdout or explicit sequential/selective inference is necessary before promoting a claim.

## Current project implication

The decision ledger still has **29/32 authenticated source sixties**, misses ranks **23/25/28**, has **zero competitive-qualified games**, no selected fixed 60, and no demonstrated 99.5%. Under the actual current state, neither statistical gate can be attempted honestly. Prioritize finishing admission and a credible symmetric two-player policy, then focus paired developmental tests on early counterexamples to avoid unnecessary full-scale CI.

**Scope:** mathematical derivation only; no claim that any fixed deck attains these probabilities. The aggregate argument does not require equal unknown per-rank probabilities, only equal rank sampling and independence under each rank's frozen environment.
