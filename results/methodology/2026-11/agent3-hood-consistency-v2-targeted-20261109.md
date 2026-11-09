# Hood Consistency v2 versus Hood Shield v1: the first independent fixed-sixty stress result

**Agent 3 | 9 November 2026 | 88 actual native games | [successful CI run 42584022716](https://github.com/FlareZ123/experiment-01/actions/runs/42584022716)**

**Decision: Retain Hood Shield v1 as the leading modified Shadow Rider hypothesis for now. The rebalance increased the use of two important consistency connectors but did not demonstrate stronger results.** The paired winner envelope remains inconclusive because 22 matched source opportunities lack two completed outcomes. No fixed sixty is proven superior in paper Expanded; no 99.5% field win claim.

## Frozen complete decks and exposed tradeoff

Two immutable 60-card sixties were frozen before the first game:

- [Hood Shield v1 printed 60](../../aichi-2026/candidate-hood-shadow-rider.json): 4 Shadow Rider V / 4 VMAX, 1 Tapu Lele-GX, 2 VS Seeker, 2 Stealthy Hood, 1 Arven and 1 Pokémon Ranger, among 60 cards.
- [Hood Consistency v2 printed 60](../../aichi-2026/candidate-hood-consistency-v2.json), [human-readable complete sixty](../../aichi-2026/candidate-hood-consistency-v2.md): same 4 V, 4 VMAX, 1 Arven and 11 Psychic, with **2 Tapu Lele-GX, 3 VS Seeker, 1 Hood and zero Ranger**. Exactly two incoming cards and two outgoing cards, no adaptation to the original opponent.

The [prospectively committed original-source registration](../../aichi-2026/registrations/agent3-hood-consistency-v2-targeted-20261109.json) contains 44 independently generated 32-bit seed+source-rank+candidate-seat opportunities, each paired across the two complete sixty-card contenders. Eleven actual authenticated original Aichi decks, ranks **1, 2, 5, 6, 7, 11, 12, 13, 24, 29 and 31**, both candidate physical seats, two independent repeats per seat. This intentionally targets rank2 Vileplume, rank31 Dusknoir/Chimecho, Mew Genesect rank5, all three Iron Thorns variants and previously observed challenger weaknesses. It is a *targeted slice of 11/29 available original sixties*, not the entire 32-opponent benchmark. The registered missing original ranks 23/25/28 were never invented.

Shared native environment and code: [frozen paired runner](../../../simulation/evaluation/agent3/hood-consistency-v2-targeted-native.cjs), [four pure tests](../../../tests/2026-11/agent3-hood-consistency-v2-targeted.test.cjs), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `agent19-composed-paper-semantics-profile-v1` with Celestial Roar, Mew Energy mix and Energy-recipient corrections. Both contenders share `actorNaturalEvolutionRoot`, original-source Mew DCE preference, generic owner-only card roots, portable VS Seeker/Guzma and Float Stone mobility. The policy is unchanged across arms, including for the source opponent. The runner executes each 44-game fixed-deck group through the supported custom single-candidate native API and joins attempts by the original frozen seed/rank/seat, rejecting inadequate physical source comparison. Native cap is 260 accepted root actions, and every error/cap remains in the registered denominator.

## Full result

| Prospectively registered measure | Hood v1 | Hood Consistency v2 |
| --- | ---: | ---: |
| Native attempts per frozen 60 | 44 | 44 |
| Native natural terminals | 28 | 27 |
| Native candidate victories | 19 | 17 |
| Native root-260 caps | 14 | 14 |
| Native engine/policy aborts | 2 | 3 |
| Actual candidate Tapu Lele-GX plays | 12 | **27** |
| Actual candidate VS Seeker plays | 1 | **4** |
| Actual candidate Stealthy Hood plays | 0 | 0 |
| Actual candidate Arven plays | 0 | 0 |
| Actual candidate Pokémon Ranger plays | 0 | 0 |

Forty-two of **44** source groups matched the actual original-source opening fingerprint and original first player. Two mismatched groups are **rank1 B repeat 8101** and **rank12 A repeat 8101**, excluded from paired causal interpretation even where both respective native games may have ended. **20/42 source-matched groups naturally finished in both arms**, with one fixed-deck winner reversal favoring original Hood v1 and zero favoring v2. The other matched groups remain unresolved in at least one arm.

The worst/best-case difference in v2 native contender wins minus v1 is the exact deterministic partial-identification interval **[-17, +14] among the 42 physically source-matched groups**. This is an outcome-censoring envelope, not a confidence interval, opponent-strength statistic or estimated win-rate advantage. The only observed paired terminal reversal contributes -1. See the [complete 44-group machine-readable original-source indicator and outcome matrix](agent3-hood-consistency-v2-paired-censor-20261109.tsv), which includes all unmatched, capped and aborted games as explicit rows.

The [original CI archive](https://github.com/FlareZ123/experiment-01/actions/runs/42584022716/artifacts/13657804109) contains every native row, action root ledger, printed physical seed and disposition (artifact `13657804109`; ZIP SHA-256 `67db8dd6ef5e2da2e0950f5ca79dd57b4e669c3efd27f0d555e38e2a8ee53a34`). The data are developmental native simulator results only. Runtime source owner policy, Japanese printing fidelity, tournament time, hidden-information protection and opponent competence are not independently paper-qualified.

## One genuine loss of an otherwise complete native game

The one source-matched completed winner reversal is **original rank5 Mew Genesect, candidate physical seat B, repeat 8102, seed `2143005893`**. The original 60 and starting player are equal. Original Hood v1 takes six Prizes and naturally wins after 171 accepted roots (final seat Prizes `[6,0]`), using four accepted Max Geist attacks in the recorded continuation. Hood Consistency v2 instead naturally loses with `[6,6]` after 153 roots. In the v2 trace, the acting candidate spent many turns using Mimikyu's Filch attack rather than converting into Shadow Rider's Max Geist. That is a **real policy/action-line failure in the changed-sixty native continuation**, with no basis to attribute it solely to the extra Tapu Lele-GX because the candidate sixty and its initial contents differ.

This rank5 source had real source Mew copied-attack activity in the new field, so the benchmark does exercise some meaningful original-source development: across the four rank5 groups, the source registered **eight Cross Fusion Strike attacks** against v1 and **five** against v2. Exact counts are rooted in the full native archive. This result remains sensitive to the current generic bot, and an independently paper-qualified source game is still needed.

## Concrete decisions

**Keep Hood v1** as the working modified-60 challenger to the champion for now. The rebalance v2 **did convert printed access into actual usage**: Tapu Lele plays more than doubled, and VS Seeker plays quadrupled. Its candidate native game wins decreased, and a complete same-source reversal went against it. This is evidence that additional access is insufficient without stronger conversion to winning attacking lines.

The central anti-lock hypothesis remains unexercised in this study: **neither contender played Hood or Arven** in any of the 88 games. Do not credit Hood v1 or v2 with experimentally demonstrated Stealthy Hood protected Underworld wins. Other researchers' prospective Arven→Hood native owner-prompt interventions could enable a meaningful head-to-head counterline; they must be subjected to the same source policy and printed payments if tested.

The native **rank31 Dusknoir/Chimecho source** still causes `CANNOT_USE_POWER` aborts, including the full-Bench Duskull Come and Get You state documented by Agent21. Its four matched original-source groups include two v1 native aborts and three v2 native aborts; they remain censored. That failure requires a scoped paper rule/native attack test, preferably the already-developed Agent21 hook, before using its results to select a final sixty. The **rank2 Vileplume** previously capped in both seats under the older profile; the new independent seed/profile rank2 cases naturally terminated 3/4 and 4/4 for v1/v2 respectively. Those separate studies cannot be pooled into one inferential estimate without controlling changes.

**Research conclusion:** This is a substantive negative deck-redesign result rather than another unexposed flag test: two distinct, fixed complete sixty-card decks generated real differing card plays, but v2 has no established advantage. Full-field strength, exact paper legality, official match-clock outcomes and the 99.5% benchmark remain open. 29/32 original opponent sixties authenticated; zero paper-competitive qualified games.
