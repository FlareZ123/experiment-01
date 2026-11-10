# Agent46: physical donor discard unlocks actual original-source Mimikyu Copycat / Timeless-GX

**10 November 2026. Positive native policy-development mechanism, no paper-qualified win.** An original rank1 Shadow Rider Calyrex list already contains both Mimikyu (GRI) and Dialga-GX (UPR). In the exact original rank10 Regidrago source game examined, Mimikyu eventually had two Psychic Energy and became Active after a real opposing Apex Dragon, yet Dialga-GX was absent from the owner's discard. An additional physical donor-payment action, using the already-included Mysterious Treasure, unlocked the intended Copycat chain **in a complete natural native game**.

## Original-source problem, directly observed

[24-arm funded-promotion null](./agent46-rank1-mimikyu-funded-promotion-source-ab-20261110.md): six preregistered source seeds × both seats × control/treatment = 24 native attempts, matched 12/12 starting physical deals, actual opposing Apex 13/17, actual Copycat **zero in both**, despite 16 new manual Psychic and two Retreat proposal callbacks. Six native focused Store tests passed, showing the local attachment and promotion actions worked.

To isolate the missing prerequisite, a separate *retrospective, observation-only* diagnostic sampled two historically blocked original-source games. The [actual native run 42730153920](https://github.com/FlareZ123/experiment-01/actions/runs/42730153920) preserved owner-perspective snapshots at the first genuine decision of each turn after an actual preceding Apex and all accepted source root-action types. On original seed **589307622, candidate seat 0**:

| First owner decision | Physical Mimikyu | Donor Dialga-GX | GX remaining? |
| --- | --- | --- | --- |
| Turn 6, following Apex | Bench, 1 Energy | Hand 1, discard 0 | Yes |
| Turn 8, following Apex | Bench, 2 Energy | Hand 0, discard 0 | Yes |
| Turn 10, following Apex | **Active, 2 Energy** | **Hand 0, discard 0** | Yes |
| Turn 12, following Apex | Bench, 1 Energy | Hand 1, discard 0 | Yes |

Despite actual paid native Retreat actions and Mimikyu's actual `Filch` attacks on turns 8 and 12, all six owner post-Apex windows in that game were without discarded Dialga. The second historical seed **538692660, candidate seat 1** had four owner response windows, a maximum of zero attached Mimikyu Energy, and no discarded Dialga.

The original owner callback transcript for seed589 also shows Dialga-GX and Mysterious Treasure together in the owner's physical hand at turn 4 while Mimikyu was already Benched. The earlier two-axis Treasure hook refused that state because it only tried searching a missing Mimikyu. This created a concrete *state-dependent discardability and access* hole.

## Implemented legal donor-payment policy

`simulation/twinleaf/2026-11/agent46-mimikyu-donor-treasure.cjs` adds one reversible owner-only branch on top of the same existing Fog, Treasure, Underworld, manual Psychic and funded-promotion policy:

- Requires the original owner to have Mimikyu physically in play, owner-held `Dialga-GX UPR` and `Mysterious Treasure FLI`, publicly visible opponent Regidrago, no Dialga in own discard, and GX unspent.
- Proposes a native `PlayCardAction` on that real Mysterious Treasure. When its **actual native discard-payment ChooseCardsPrompt** opens, selects that same physical Dialga from the owner's still-held hand. The card's printed effect then performs the normal Psychic/Dragon search; no artificial discard, card creation, opponent hidden-state inspection, or deck inspection before genuine search.
- The separately added `tests/2026-11/agent46-mimikyu-donor-treasure.native.test.cjs` passed four native physical source-card tests, two in each seat. The native Store moved the real Dialga from the owner's hand to discard, preserved already Benched Mimikyu, and opened the printed deck search.

## Actual original-source historical matched outcome

[Retrospective paired CI run 42731334936](https://github.com/FlareZ123/experiment-01/actions/runs/42731334936), source 60s fixed, same initial physical source deal within each pair, native 180-root action cap:

- **589307622 / seat0:** original funded-policy control had six opponent Apex and **zero Copycat**. Added donor route had three opponent Apex and **one real native Mimikyu Copycat on turn 6**. The treatment's native root action ledger shows accepted `PlayCardAction` **Mysterious Treasure on turn 4**, with an actual native physical Dialga payment callback.
- [Read-only root-choice replay 42731950941](https://github.com/FlareZ123/experiment-01/actions/runs/42731950941) confirms the subsequent **accepted native `ChooseAttackPrompt` at root ordinal 77**, on turn 6, selected **`Dialga-GX UPR` / `Timeless-GX`** as the copied attack (attack index 2). The preceding `Copycat` attack is root ordinal 76. On candidate's ensuing own turn 7, actual owner GX-used status is true; this supports the intended copied-GX extra-turn sequence.
- **538692660 / seat1:** neither policy actually played a donor Treasure, and the unchanged original source yielded **zero Copycat** in both arms. Initial physical deal matched.
- **Both 589 treatment and control were native action-censored at 180 roots**, and Copycat took zero Prize cards immediately (6/6 before and after). Native action progress establishes executable causality in this *selected historical seed*, not a better match win rate, fully resolved copied-attack damage, or strength against the broader field.

Raw replay artifacts: run 42731334936 artifact `13724733231`; exact attack-choice replay run 42731950941 artifact `13725805519`. The same pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and original rank1/rank10 60-card source lists were used for both arms.

## Next decisive action

A fresh, fully preregistered [eight-seed, both-seat, 32-native-attempt prospective panel](../../methodology/registrations/agent46-mimikyu-donor-treasure-prospective-source-ab-20261110.md) separates the selected-source causal mechanism from its frequency in naturally sampled games. Entrypoint: `simulation/evaluation/2026-11/agent46-mimikyu-donor-treasure-prospective.cjs` with the same actual raw-ledger and error/censor admissions. Preserve the outcome whether it confirms, weakens, or reverses this single-seed improvement.

For deck strength, further progress requires a paid attack on the following extra turn that actually takes Prizes, credible opponent policy, and a fixed full-32 matchup qualification. **This report nominates no final deck and asserts zero competitively paper-qualified games.**
