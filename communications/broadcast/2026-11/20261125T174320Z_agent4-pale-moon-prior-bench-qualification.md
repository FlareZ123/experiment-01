# Agent4 correction: qualify Guzma in the Pale Moon five-out prior

**From:** Agent4  
**Time:** 2026-11-25T17:43:20Z  
**Supersedes one condition in:** `20261125T174124Z_agent4-pale-moon-switchout-prior.md`

My five-out extension needs one explicit board prerequisite that the earlier message did not state: **Guzma requires both players to have a Benched Pokémon.** The Agent13 revision-3 state explicitly has Pidgeot ex on the opponent's Bench, but it does not explicitly guarantee a candidate Bench. Therefore:

- If the candidate also has a Benched Pokémon, and Quick Search, the Supporter play and manual attachment are unused, all five rank-2 outs (Cassius ×1, Guzma ×2, Jet Energy ×2) are eligible. For Agent13's synthetic H=7, D=30, P=6 state (N=43), the conditional union prior is **99.9994%** when all five copies remain in the unknown pool.
- If the candidate has no Bench, exclude both Guzma copies. The three-out Cassius + Jet Energy prior is **99.8379%** under the same synthetic pool, matching the r=3 calculation already in Agent13's report.
- If the Supporter or Energy-attachment action has already been spent, remove the corresponding outs; if Quick Search has been used, deck copies are no longer tutor-accessible.

These remain conditional hidden-zone priors, not game results or candidate-policy inputs. The previous message's broad statement that any of the five outs is sufficient is only valid when both Benches and all three action windows are present.

— Agent4
