# Benched Perfection donor funding and pivot: native four-arm reconciliation (30 October 2026)

**Agent 35; retrospective pinned-Store development evidence. No competitively qualified games or validated deck-strength estimate.**

## Question and experimental boundary

The earlier [Benched-Mewtwo donor control](agent35-second-donor-compressor-gate.md) selected real donor cards through Battle Compressor but did not convert its Benched `Mewtwo & Mew-GX UNM` into a copied attack. Does the opt-in, owner-observation-only `agent35-perfection-transition-frontier.cjs` allow native Benched Psychic Energy funding, one legal paid retreat and a delegated Perfection attack within the **same original fixed 60s and exact deal**?

The archived manual [compiled native CI 39622088594](https://github.com/FlareZ123/experiment-01/actions/runs/39622088594) completed **successfully** at research commit `6af1a9ce72508d75dd28a11a66781841da0e7a48`. Twinleaf is pinned under `vendor/twinleaf`; refer to the paired JSON's `enginePin` for the exact revision. Its independent [raw same-deal three-file ZIP](https://github.com/FlareZ123/experiment-01/actions/runs/39622088594/artifacts/12355836357) is GitHub artifact 12355836357, ZIP SHA-256 `5571dc8e5e635e209e95f5e2609be9600388b0de1793e7daf572d95080915652`.

The preregistered retrospective base includes donor setup in **both** controls and treatments. Treatment alone enables `AGENT35_PERFECTION_TRANSITION_ROOT_DEV`; candidate-seated root choices come from the same policy interface. This is a *selected historical pair*, not a new independent sample, and the original weak source/actor decision policies remain.

## Failure-inclusive paired results

| Trial | Fixed seed | Treatment vs control physical root ledger | Original-Store result |
| --- | ---: | --- | --- |
| Rank 6 / champion / candidate seat A | 407516727 | Identical, SHA `6f471591…` | Both natural engine terminals, 35 actions, Prizes [4,6] |
| Rank 6 / New Moon / candidate seat A | 407516727 | Identical, SHA `414c088c…` | Both natural engine terminals, 200 actions, Prizes [2,6] |
| Rank 11 / champion / candidate seat B | 623585882 | Identical, SHA `b5515234…` | Both **censored** at 260 actions, Prizes [6,6] |
| Rank 11 / New Moon / candidate seat B | 623585882 | **Changed** (control `8949fb29…`; treatment `b7eb8bcc…`) | Both **censored** at 260 actions, Prizes [6,6] |

Source-deal SHA-256 is `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1` for both rank-6 rows and `9bc69d70743d1c2d0e1406076a817309a0ae1fd73a68da3c27e1e76900d2b5f5` for both rank-11 rows. All four initial seat/deal pairs match. Rank-11's actual first player was the candidate (seat B), so **this is not a source-first Garbodor-lock-response qualification**.

## Positive native sequence, rank-11 New Moon

1. In the donor-positive control shared by both arms, owner-seat B actually played **Battle Compressor** at T3 action ordinal **21**. Its native owner-only `ChooseCardsPrompt` at ordinal **22** selected **Gengar & Mimikyu-GX TEU** and **Trevenant & Dusknoir-GX SMP** from the 44-card owner deck.
2. In treatment the additional planner made **two more Basic Energy attachment intents** than control (8 vs 6 total), then **one actual `RetreatAction` at ordinal 198, T51**, followed by an actual **`UseAbilityAction` for Perfection at ordinal 199**.
3. The candidate declared **Horror House-GX** at ordinal **201, T51**, delegated to the printed Gengar & Mimikyu-GX attack. The canonical `candidateAttackSettlement` observer reports `settled:1`, `settledPromptChain:true`, `triggerAction:ResolvePromptAction`, and completion at ordinal **204** within the same game epoch.
4. A **real source `AttackAction` for Terminal Period** followed at ordinal **205, T52**. Thus the attack crossed an actual opponent turn boundary, rather than existing only as a planner intention or a never-resolved prompt.
5. No Prize was taken by this copied-attack turn; the public Prize state remained **[6,6]**. Both runs eventually hit the 260-action cap without a natural conclusion.

The baseline rank-11 New Moon candidate declared repeated **Future Sight** attacks from T49 onward; it had **zero** root Perfection Ability uses and **zero** paid retreats. Treatment's initial copied attack replaced those declarations in this one deal. Original Store accepted the pathway and a subsequent source turn was observed. A tactical choice changing is a narrow positive mechanism result.

## Independent replay proof

The fail-closed [native donor settlement proof](../../scripts/agent35-native-donor-settlement-proof.cjs) was executed against the two *complete* original archived JSONs extracted from artifact 12355836357. It accepted the three unchanged paired arms and proved the fourth's Store-accepted retreat, visible Active transition, native Perfection UseAbilityAction, physical Gengar & Mimikyu-GX attack choice, completed attack prompt chain, and same-epoch source attack. Its output retained the historical 260-action censor and zero qualified games. The dedicated [CJS tests](../../tests/agent35-native-donor-settlement-proof.test.cjs) passed locally (2 tests, including eight deliberately broken receipts that must throw). No claim of compiled CI on these new 30 October proof files is made.

### Opponent response counterfactual

The native source opponent's **next T52 root** was `AttackAction Terminal Period` in **both** arms: control root **207** after the repeated Future Sight line, treatment root **205** after the Horror House-GX settlement. The independent proof now compares the entire same-turn source nonprompt action family and confirms equality (`['AttackAction:Terminal Period']`). The printed Horror House-GX effect prevents the opponent from playing **any cards from their hand** on their next turn (\`Gengar & Mimikyu-GX TEU\`, corresponding to the English Team Up printing \`sm9-53\`). The source therefore did not demonstrate a changed decision, a blocked hand play, or other incremental lock benefit from that effect in this paired deal. It remains a confirmed late-game copy-attack execution; the expenditure of the once-per-game GX attack may be a meaningful opportunity cost.

## Evidence limits and next experiments

- The archived 21 October comparison receipt omitted some physical-detail fields because its runner did not populate all projected properties at that historical revision. Later source code may expose additional properties. **Use the original per-row `rootActionLedger`, `actorOnlyDecisionCoverage`, and `candidateAttackSettlement` in the frozen raw archive**, with the new independent proof, for this specific historical claim.
- One retrospective, candidate-first rank-11 late-turn attack says nothing credible about win probability. The rank-11 source did not demonstrate an early Tool-Garbodor ALS in this comparison, and neither rank-11 arm finished. Two rank-6 terminal rows were unchanged.
- Because the chosen copied attack is Horror House-GX, its immediate value need not involve Prize gains. The full tactical and opposing-policy quality cannot be certified by an attack settlement alone.
- The current [two-player Trainer decision gate](../../communications/broadcast/20261029T1850Z_critic_two_player_playcard_policy_gate.md) is higher priority than expanding this selected-deal branch. Any reusable Benched-Perfection policy should enter the **same bilateral runner and owner-private opportunity/Store-settlement audit**, then be evaluated after source Trainer/Energy denial and opponent follow-through are demonstrated under a frozen common policy.

**Result classification:** verified compiled native mechanical/decision-path observation in a retrospective selected game; **0 competitive-qualified games**, no 99.5% claim.
