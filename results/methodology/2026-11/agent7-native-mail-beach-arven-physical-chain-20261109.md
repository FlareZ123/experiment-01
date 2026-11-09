# Original rank-3 Snorlax: one real Mail → Beach → Arven → Item+Tool native turn chain

**Status (9 November 2026):** The original rank-3 Snorlax Stall sixty against original rank-13 Regidrago sixty executed a genuine native three-turn multi-axis resource chain in physical source seat 1. This is an important **game-state execution capability**, with **zero competitively qualified games and no measured win rate**.

## Exact observed sequence

In source trial `3:0:A:agent2-original-rank13-v8-common` and original fixed seed `290134`:

| Global turn | Native Store event | Custody or turn-resource receipt |
| --- | --- | --- |
| 1 | Play `Trainers' Mail ROS`, resolve genuine top-four `ChooseCardsPrompt` | Physical `Arven OBF` selected and moved into source owner's hand |
| 1 | Play `Tropical Beach BWP 50` from owner hand, then use Stadium | Source hand 7 → 6 → 7; source deck 45 → 44 |
| 2 | Opposing rank-13 player played `Dedenne GX UNB` | Genuine native `WANT_TO_USE_ABILITY` owner Confirm prompt resolved **false** via opt-in, with exact Store settlement. Their existing ordinary owner policy also attached `Fire Energy MEE`. |
| 3 | Play the exact previously Mail-selected `Arven OBF` | Accepted native `PlayCardAction`; consumed Supporter quota, `supporterTurnAfter=1` |
| 3 | Resolve Arven `CHOOSE_ONE_ITEM_AND_ONE_TOOL_TO_HAND` from acting owner's actual deck | Native prompt 18 accepted physical `Nest Ball SVI` and `Float Stone BKT`, each absent from original owner hand and present there after search; neither remains in owner deck |

The subsequent native baseline placed `Articuno-GX CES` in source seat 1, and opponent turn 4 included a genuine `Mysterious Treasure FLI` payment prompt. The treatment progressed through global turn 8 and 55 accepted roots before encountering a still-unimplemented `AttachEnergyPrompt`, safely quarantined. The same common Confirm bridge without Arven reached turn 6 and 42 roots. Those tail counts are **developmental execution coverage only**; they do not establish game advantage because all player policies remain incomplete.

## Precisely what changed

The previous exact original source test physically proved Mail plus Beach on turn 1, yet aborted at the rank-13 owner's unanswered `ConfirmPrompt` on turn 2. The native `Store` trace proved the blocked card was `Dedenne GX UNB`, with a `WANT_TO_USE_ABILITY` prompt. In the other original orientation, a similar confirmation followed an attack.

Two small default-off changes allowed continuation:

1. The owner-only Mail-selected Arven proposal now precedes the intentionally quarantined raw-State decoder, using the *same physical card identity* and a detached actor-only observation with an unused Supporter quota. The native Arven search handler selects an actual Item and Tool from the owner's authorized deck prompt and validates the pair through the pinned native prompt API. All actions are correlated with accepted `Store.dispatch` actions and physical zone custody.
2. The shared owner Confirm option resolves the actual recipient's native `ConfirmPrompt` using the conservative `false` policy from existing Agent32 research. Each response is validated against the native state, submitted through the real Store and checked for exact settlement. Across two orientations the treatment settled **18 owner prompts**, with **0 rejected or unsettled** in the successful native run. Declining Dedenne's draw Ability can materially weaken the Regidrago opponent, so this is strictly an execution-coverage bridge rather than evidence of opponent competence.

The two paired arms share this same Confirm bridge, first-turn Mail policy, early Beach policy, original printed 60s, candidate rank, seed, and native version. The treatment enables only the follow-up Arven action.

## Reproduction

- [Native success CI 42541148109](https://github.com/FlareZ123/experiment-01/actions/runs/42541148109), commit `bb4ce7956ae2532626ae3345998b129541ebf62b` at dispatch (workflow from current main), uploaded artifact `agent2-v8-common-first-owner-root`, artifact ID `13641790518`.
- The shared native workflow `.github/workflows/agent2-v8-common-owner-root-canary.yml` uses opt-in `agent7_mail_beach_arven_confirm=true`; no new stand-alone CI workflow was added.
- Native runner `simulation/evaluation/2026-11/agent7-rank3-mail-beach-arven-native.cjs`. Development switches `AGENT7_OWNER_CONFIRM_DEV=true` and `AGENT7_TREASURE_BRIDGE_DEV=true` are set by the workflow. The output is `artifacts/agent7-mail-beach-arven/paired-native-with-confirm.json`.
- Acting-owner adapter `simulation/twinleaf/agent38-v8-four-arm-owner-mail-native.cjs`, choice helper `simulation/twinleaf/agent7/mail-arven-owner-choice.cjs`, exact public PlayCard boundary observer `simulation/twinleaf/agent7-owner-playcard-boundary-audit.cjs`.
- Pure regression tests under `tests/2026-11/agent7-`. Pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Registered paired comparison `results/aichi-2026/registrations/agent7-owner-confirm-mail-beach-arven-20261109.json`; retrospective exposed seed acknowledged.

## Next substantive step

**Use the two actual Arven-retrieved cards.** In the source game, `Nest Ball SVI` and `Float Stone BKT` are in hand after turn 3, yet the generic owner policy next played `Articuno-GX` and did not consume the searched Item. An actor-authorized native Nest Ball Item root plus a real owner-deck Basic search and Bench arrival would extend this one decision from resource access into actual lock-board development. If a suitable Pokémon is found, compare the gained board position against the baseline's Articuno opportunity cost. Keep future activation and the 128-root cap failure-censored.

## Limits

The field still has only **29/32** full original name/count sixty lists and excludes ranks **23, 25 and 28**. Paper printing admission is provisional. This is one retrospectively selected deterministic original matchup, with two orientations and one confirmed physical sequence. The late raw-State fallback remains quarantined, and no complete paper-valid match, tactical superiority, opponent-competence certification, win-rate estimate or fixed universal deck recommendation follows.
