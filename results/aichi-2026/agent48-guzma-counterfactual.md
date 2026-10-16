# Rank-6 Guzma self-switch: compiled bounded policy counterfactual

**Agent 48, 16 October 2026. Claim level: observed local action-policy effect, not match-strength evidence.**

## Exact test conditions

[Successful manual CI 38844419826](https://github.com/FlareZ123/experiment-01/actions/runs/38844419826) built the existing pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and executed two 100-action bounded, nonterminal games. Raw `aichi-guzma-counterfactual` artifact **12022827840**, ZIP SHA-256 **`034cbb0b72556f79fa8121fcd32f73a47dd40b65dcba6e66a1cc85a727a3d341`**, was downloaded and its JSON checked.

Both arms use exact Hood Shield v1 source inventory in physical slot B, exact rank-6 Iron Thorns inventory in physical slot A, seed **20367161**, proven first-turn slot A and the same default SimpleTacticsAi plus Double Dragon recovery and Supporter-decision correction. They isolate policy decision RNG, apply the strict prompt check and retain the same resolved deck and engine. The only requested difference is the opt-in `guzmaSelfSwitchGuard` which filters one very narrow self-switching Guzma proposal.

## Immediate counterfactual observation

| Candidate's action | Baseline | Narrow Guzma guard |
| --- | --- | --- |
| Turn 2: attach Psychic Energy, attach Stealthy Hood, play Mysterious Treasure, select and Bench Dialga-GX | Observed | Observed identically |
| Turn 2: next major action | Play Guzma | Use **Shadow Mist** attack |
| Turn 2: Active position afterward | Dialga-GX | Shadow Rider Calyrex V |
| Turn 4: end of candidate turn | Pass with Dialga-GX Active | Use **Shadow Mist** attack |
| First 100 actions | Nonterminal | Nonterminal |

The guarded result is consistent with the official Shadow Rider Calyrex V (CRE 74) printed `Shadow Mist`, which requires one Psychic Energy and has an effect denying Special Energy and Stadium plays from hand during the opponent's following turn. The baseline prematurely spends Guzma and places a Bench Dialga-GX into the Active Spot; this Dialga-GX (UPR 100) requires Metal Energy for every printed attack and retreats for three Colorless, while the exact Hood candidate runs Psychic Energy only. The [six-game source trace](agent48-guzma-active-trap.md) records the original Dialga-GX Active over six consecutive candidate pass turns.

These are **reproducible action differences in the compiled engine**, not predictions from card-score metrics. Both arms made identical observed meaningful candidate setup actions until the disputed Guzma proposal. After divergence, seed equality does not ensure identical subsequent physical event sequences, and these short runs do not finish a game or validate longer-term optimality.

## Implementation and limitations

- [Pure guard](../../simulation/twinleaf/guzma-self-switch-guard.cjs) examines the proposed Guzma action, an Active Shadow Rider V with basic Psychic attached, an otherwise empty-Energy sole Bench Dialga-GX, and opposing Active Iron Thorns ex. It declines exactly that proposal and preserves the Supporter turn marker. Other deck/matchup states are intentionally excluded.
- [Headless opt-in integration](../../simulation/twinleaf/headless.cjs) dynamically patches the upstream Supporter tactic and restores it in `finally`; no vendor source is edited. Experimental runs record the guard flag and append `GuzmaSelfSwitchGuard-v1` to the policy name.
- [Fixed-source replay](../../simulation/evaluation/aichi-guzma-counterfactual.cjs) uses the existing source printing resolver and two bounded `runMatch` calls. [Manual CI workflow](../../.github/workflows/aichi-guzma-counterfactual.yml) compiles the pin and archives the result; [unit tests](../../tests/guzma-self-switch-guard.test.cjs) and existing trace tests passed in the same run.

**Interpretation:** The generic bot overlooked an immediate one-Psychic disruption attack when proposing a high-opportunity-cost Guzma line. This is a local pilot-policy improvement. It does **not** establish that Guzma should always be held, that the candidate deck is superior, or that any of the six trial outcome labels are human-level match predictions. Stronger validation would compare actual win-condition progress using capable policies against several published opponent ranks, not maximize Shadow Mist count alone.
