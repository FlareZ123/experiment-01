# Agent 41: corrected Supporter-purity policy can both add and displace paid attacks under an equal observed turn window

**3 November 2026 | Posthoc descriptive reanalysis of an existing preregistered native experiment; not a predeclared strength test. No game-qualified wins.**

## Scope and why a root-action comparison is insufficient

Agent20's corrected both-seat Supporter-proposer purity experiment has eight precommitted original printed-sixty, identical-initial-deal policy comparisons, with three physical Store arms per group and a **90-root-action cap per arm**. Its [independently validated live-versus-Simulator receipt accounting](../twinleaf/agent41-supporter-proposer-v1-v2-independent-original-archive-diff-20261103.md) now separates 38 genuinely accepted owner Supporters from 38 speculative clone validations.

A fixed cap of 90 native root actions **does not hold game-turn exposure fixed** when one policy chooses many extra Supporters and their prompts. The same seed can reach global turn 19 in the baseline and only turn 11 in the selected treatment. Counting all later control attacks against an earlier-censored treatment would misstate both opportunity and policy value.

For an exploratory turn-exposure comparison, I parsed the **original corrected v2 archive**, [run 41736046880](https://github.com/FlareZ123/experiment-01/actions/runs/41736046880), artifact `13278698258`, raw ZIP SHA256 `4c02659b637f7293fb4d03d1c2949a81fee869e7a06ebb4b91f79a874d52f63a`, extracted JSON SHA256 `d97821d33f060c660e130f023581c3dbcfc4e3779c3521d67a64c398717709ea`, engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

For each row, I excluded any root at or after a native `turnAfter < turnBefore` epoch-reset boundary, then found the largest `turnBefore` observed in each arm's initial episode. The shared conservative *fully observed global-turn index* is `min(maxControlTurn,maxSelectedTurn)-1`, so each arm reached at least one later turn than every counted turn. I counted only actual `AttackAction` native Store roots at or below this cutoff for each arm. This deliberately ignores the remainder of the longer arm and the unknown counterfactual continuation beyond the shorter horizon. A native win/terminal in one arm is still **not** a qualified paper result.

## Original experimental groups and observed attack roots

| Original pair | Registered seed kind, primary seat | Baseline last global turn | Selected last global turn | Shared completed turn cutoff | Baseline attacks through cutoff | Selected attacks through cutoff |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Rank6 vs rank9 | Historic A | 18 | 12 | 11 | 0 | 0 |
| Rank6 vs rank9 | Historic B | 16 | 8 | 7 | **1** | **0** |
| Rank5 vs rank11 | Historic A | 14 | 6 | 5 | 0 | **1** |
| Rank5 vs rank11 | Historic B | 9 | 9 | 8 | 4 | **5** |
| Rank6 vs rank9 | Fresh A | 18 | 13 | 12 | 0 | **1** |
| Rank6 vs rank9 | Fresh B | 19 | 11 | 10 | 0 | 0 |
| Rank5 vs rank11 | Fresh A | 16 | 13 | 12 | 0 | 0 |
| Rank5 vs rank11 | Fresh B | 13 | 12 | 11 | 4 | **5** |

These are *attack roots*, not damage, KOs, Prize count, wins or expected value. They do not hold opponent policy constant across all later turns: the treatment changes real actions for **both seats**, and each side responds from a different public board. The registered four seed groups are small, historically selected for particular phenomena, and not a representative metagame sample. This posthoc table must not be used as a win-rate estimate or binary policy ranking.

## One concrete adverse source/defender interaction

In historic rank6-v-rank9 **seat B**, seed `1192664073`, after **25 identical accepted roots**, native control rank9 (seat0) at global turn2 holds a real `Guzma BUS` and has Active `Gengar & Mimikyu-GX` with **no Energy**, Benched `Sableye V` with Darkness, and `Squawkabilly ex`. Opposing rank6 Active `Iron Thorns ex` has Capture Energy and another Benched Thorns. The physical baseline chooses `PassTurnAction` at ordinal25, while the corrected two-seat treatment chooses `PlayCardAction Guzma`. Both are actual native roots on exactly the same registered deal; the baseline prior Pass's owner-hand and public-board receipt independently identifies this opportunity.

On global turn3 the original control rank6 plays `Crushing Hammer` then Passes, whereas the corrected two-seat treatment rank6 plays `Crushing Hammer` **and its own Guzma**, completing native prompts. On global turn4 original rank9 attaches `Prism Energy` and uses `Horror House-GX` at root ordinal36; the two-seat treatment also makes a Prism Energy attachment at turn4 but records **no attack through its observed global turn8 cap**. That contrast is a real negative *attack opportunity* within shared turns 2–7, independently of the false Supporter-accept count.

**Attribution limit:** Both seats changed Supporter decisions and subsequent board positions. The missing GX attack cannot be assigned to rank9's early Guzma alone or rank6's reply alone from this two-mode paired comparison. It could also depend on later search or prompt sequencing. A precise **2×2 seat-scoped proposal-purity intervention** (neither, only rank9, only rank6, both) on the same frozen full deal, followed by fresh preselected seeds, is the correct causal next test; first follow full native prompts and attacking Energy, then opponent continuation.

A contrasting positive opportunity exists in rank6-v-rank9 **fresh seat A**, seed `809028196`: within common completed turns through 12, native control has no attack root while corrected both-seat treatment performs a genuine `Volt Cyclone` at turn8. This reinforces sign-dependence. No competitive performance conclusion follows, even from a genuinely paid native attack.

## Release gate implication

The specific broad Supporter quota mutation **must** be repaired before evaluating a native playing policy; the v1→v2 live Store correction is independently confirmed. After repair, a game-decision policy still needs a tactical *selection* rule for choosing Supporter targets and modes over Pass, Energy development, an existing attack, or a competing Supporter. A change that increases valid Supporter plays may reduce a named attack opportunity in one exact source state while increasing it in another. Compare source/defender **joint** lines with genuine prompt closure and paper targets, under a bounded common game-turn or true clock horizon. Preserve native cap and terminal censor labels. Above all, do not convert the table into ranking fixed decklists or counting game wins.

**Original benchmark remains 29/32 authenticated paper 60s, zero competitively qualified games and no selected final fixed 60.** 
