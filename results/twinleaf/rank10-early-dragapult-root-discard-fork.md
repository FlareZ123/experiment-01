# Rank-10 Regidrago: earlier physical Dragapult discard, faster one-seed engine terminal

**Agent 20, 18 October 2026.** This is a real-source, one-prompt causal intervention on a retrospectively selected published-rank matchup. Both branches end with a rank-10 engine win against an unqualified simple-bot rank-1 opponent. The intervention finishes two global turns and eleven logged actions earlier; **this is not a competitive win-rate result, policy endorsement, or independently verified paper-rule conclusion**.

## Exact source and recorded counterfactual

- Source opponent: exact published Aichi 2026 rank **1 Shadow Rider Calyrex** 60, physical seat A (0). Challenger: exact published rank **10 Regidrago** 60, seat B (1), first player according to actual draw log.
- Frozen deal seed `4246551500`; pinned Twinleaf source submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; simplified `DoubleDragonAttachTactic-v4`, `doubleDragonRecovery:true`, `isolatePolicyRandomness:true`. Max actions 350.
- At global turn **3**, the source bot physically played `Mysterious Treasure FLI` at game decision ordinal **23**, then proposed to discard `Raihan EVS` at ordinal **24**. The source held `Dragapult ex TWM` in its own hand.
- The experimental root-only `Store.dispatch` wrapper substitutes **one** `ResolvePromptAction` for that already-present `ChooseCardsPrompt(CHOOSE_CARD_TO_DISCARD)`, selecting the actual held `Dragapult ex TWM` by card reference after checking `prompt.validate([card])`. The source bot still proposed Raihan, and the root-only observer verified that the alternative actual card physically reached the discard pile. No card or target was injected into the owner hand/deck; downstream opponent and candidate choices used the original bots.
- The physical Store source transcript's first action difference is **root dispatch ordinal 26**, matching prompt id 16. The *pre-dispatch zone digest* is identical in both branches: `c66248693c9ce0aaf2d3141dee60ac97676845e2b68efb9df770bbc4f9f3a6e4`. The root selection changed from Raihan (prompt pool index 0) to Dragapult (index 2). The next zone digest differs as expected.

## Observed outcomes of that exact source deal

| Outcome | Original source bot discards Raihan | One actual-root prompt discards Dragapult |
| --- | ---: | ---: |
| Engine finished | Yes | Yes |
| Winner, physical seat | **1** (Regidrago) | **1** (Regidrago) |
| Final Prize cards remaining [rank1, rank10] | **[2,0]** | **[2,0]** |
| Global terminal turn | **25** | **23** |
| Logged game actions | **168** | **157** |
| Root `AttackAction('Apex Dragon')` declarations by rank10 | **6** | **5** |
| Observable-game SHA-256 | `376b5219aafa79a3730e0a574e5d538b2b927180ea66d0c79df717228ee071dc` | `901e1f5fa7073a3b6961563055dd19fad03d3bf8b913a72d4725e30b3fe6485d` |

The unmodified source control **before and after** the intervention reproduced the same observable digest. On the altered branch the bot continued through a completed engine game with fewer Apex attack declarations and an earlier terminal win. The copied attack identities and post-attack damage/Prize effects were *not independently inspected by this experiment*. It would be premature to attribute the difference specifically to Phantom Dive rather than the combined downstream effect of changed discard and subsequent autonomous simple-bot choices. An actual Store Apex copy-choice/effect witness is the next test.

## Reproducibility and scope

- [Source runner with one-choice fork, root observer and exact causal checks](../../simulation/twinleaf/rank10-early-dragapult-discard-fork.cjs).
- [Three unit tests for owner-zone/card legality, source Store isolation, and hand-discard chain](../../tests/rank10-early-dragapult-discard-fork.test.cjs).
- Fully successful [manual compiled CI 39162182185](https://github.com/FlareZ123/experiment-01/actions/runs/39162182185), git head `70058ea1b3fa881541d49f313b576d8786e293dc`, existing [bounded workflow](../../.github/workflows/aichi-dde-runtime.yml) with `targeted_only:true,dragon_discard_audit:true`.
- [Raw experiment artifact 12148939395](https://github.com/FlareZ123/experiment-01/actions/runs/39162182185/artifacts/12148939395), archive `sha256:a2a4ff261ad3e3a072ceb08607104ce2180a129e3c3e6dd76dac75da031ef225`.
- [Prior three-deal owner-hand resource audit](../../simulation/twinleaf/regidrago-dragon-discard-source-run.cjs) identified this exact opportunity retrospectively. The probe is not a prospectively sampled, seed-independent policy experiment. A mechanical comparator does not fix bot strength, source-game hidden-information fidelity, engine support of paper card effects or 32-rank field coverage.

**Interpretation:** Earlier discard access to a strategically useful Dragon payload is physically realizable through a real search-card discard cost in at least one registered Regidrago source deal. The original bot's high-level access and Apex attack counts do not explain the branch outcomes alone. Preserve bot proposal, actual root-selected Card, copied-attack selection, damage/Prize effects and terminal result as different evidence levels. Full benchmark remains **29/32 exact opposing lists and zero independently qualified competitive games**. This report nominates no fixed final 60.
