# Agent 8: original-source-only adversarial 2×2, preregistered native eight-deal result (2026-11-09)

## Objective and actual construction

Test whether strengthening the *original Aichi opponent* changes the apparent performance of one fixed New Moon Lockbreaker 60-card candidate and its native donor-funded Perfection attack pivot. Authenticated original Aichi sources were ranks **5 Mew Genesect, 11 Absol Garbodor, 13 Regidrago, 31 Dusknoir Chimecho**, each with two candidate seats. No deck cards were changed. All seeds were frozen before the first native simulation.

The eight independent Python secrets-generated seeds and four-arm design were registered in [the frozen registration](../../aichi-2026/registrations/agent8-source-challenger-prospective-20261109.json). There are four native game arms for each seed: P0S0 (no pivot, baseline opponent), P1S0 (funded donor-to-Active pivot, baseline opponent), P0S1 (no pivot, stronger source option), P1S1 (both). S1 applies only to the original-source seat and enables existing owner-public nominal potential KO, funded Float Stone retreat and VS Seeker into Guzma. The native Guzma prompt handler is common to all arms.

Executable: [four-arm native runner](../../../simulation/evaluation/2026-11/agent8-source-challenger-2x2.cjs), five passing pure tests. Pinned Twinleaf commit a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. All 32 Store attempts retain original sixty, full physical deal and original source-deal fingerprints.

- [Completed GitHub Actions run #42544821750](https://github.com/FlareZ123/experiment-01/actions/runs/42544821750), successful at 2026-11-09 01:20 UTC.
- [Raw full-native ZIP artifact #13642474544](https://github.com/FlareZ123/experiment-01/actions/runs/42544821750/artifacts/13642474544), with all 32 physical actions, four-arm comparisons, errors and abort evidence.
- All **8/8** complete four-arm deals match exact source and full physical opening fingerprints. **4/8** groups terminated naturally across all four arms. Overall: **18 native terminals, 8 native errors, 6 root caps**. Errors and caps are censored.
- One genuine native winner reversal on **original rank31, candidate seat B, repeat3107, seed805653769**: original source won P0S0, then the New Moon candidate won P1S0. Original source also won P0S1 and candidate won P1S1. Thus the candidate-funded pivot changed winner in each source condition on this physical encounter. No field win-rate estimate follows from this single result.
- **Zero first-root action divergences attributable to the source challenger** across all 8 original deals in either pivot condition, where action ledgers were returned. This narrow source challenger was inactive and does not establish competent opponent response.

## Implemented correction in the next prospective arm

Actual original-source roots expose a more basic action failure: rank5 Mew Genesect repeatedly passed with no attacks even though its original 60 carries 4 Genesect V, 4 Quick Ball and 3 Trainers' Mail. Rank11 and rank31 also had frequent original-source Pass roots. Adding rarer tactical toggles to this weak source policy cannot substitute for search and board construction.

A completely new, independently generated second cohort was frozen before use in the [v2 registration](../../aichi-2026/registrations/agent8-source-challenger-prospective-v2-20261109.json). The [v2 native runner](../../../simulation/evaluation/2026-11/agent8-source-challenger-2x2-v2.cjs) adds source-only Quick Ball roots, actual Trainers' Mail after a native Pass, and common both-seat bounded owner deck-search and mandatory-discard prompt bridges. The causal comparison still holds the original 60, candidate 60 and physical deal fixed in each four-arm group. Evaluate by accepted Store actions and naturally completed game outcomes, with all errors censored.

## Interpretation

Developmental simulated games only. **Zero competitively qualified paper games**, **29/32 verified original source inventories** (ranks 23, 25, 28 missing), no demonstrated 99.5% field win rate. The presence of a new source policy option is not evidence that the policy is used successfully, as this experiment illustrates.
