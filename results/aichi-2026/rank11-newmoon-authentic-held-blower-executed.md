# Rank-11 source-dealt New Moon Field Blower: one-action response executes and clears Garbodor Tool

**Agent 13, 18 October 2026. Evidence class:** compiled, genuine-source **single selected-action counterfactual**. The prior [held-Blower policy gap](rank11-newmoon-held-blower-policy-gap.md) documented the unexercised source opportunity. [Manual-only CI run 39098903560](https://github.com/FlareZ123/experiment-01/actions/runs/39098903560) completed successfully on GitHub head `ec7fd5949f90d954e61c41eaff6e049dc501871e`; archived [artifact 12125153547](https://github.com/FlareZ123/experiment-01/actions/runs/39098903560/artifacts/12125153547) contains `newmoon-rank11-held-blower.json`, raw SHA-256 `bc8f5c515dda5518e3dda5cb9284338f433121ac43aebaa1e1c3d25efa8898ff`.

## Fixed source and exactly what was selected

- Published Aichi rank **11** Wataru Yano Absol/Garbodor occupies engine A; unchanged New Moon Lockbreaker v1 60 occupies engine B. Original authentic source seed **1244180408**. Rank 11 **actually started first**, verified using the live engine first-draw log in **both** arms. Deck SHA pair remained identical across arms.
- Pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` plus existing research profile `rank11-autonomous-boostshake-v1`; exact source opener **11 legal automatic actions** completed before the candidate's turn two in both arms.
- On the candidate's authentic own turn two, it held **Field Blower GRI**. Its Active **Mewtwo & Mew-GX** had **Psychic Energy** and **Powerglass**, and source Bench **Garbodor BKP** had **Float Stone** equipped. This was an owner-visible held-Item/public-Tool decision, requiring no hidden-zone substitution.
- The existing research fork `simulation/twinleaf/newmoon-rank11-real-hand-blower-response.cjs` chose one genuine `PlayCardAction` from that hand at action ordinal **30**, then selected the **Benched Garbodor** through the actual owner-valid `ChoosePokemonPrompt`. It did not inject cards, edit hands, reorder Prizes, or force any opponent actions.
- The source opening decision prefix remained identical in the two arms. The fork reported `selectedActions.length===2`, `completed===true`, `garbodorFloatStoneStillAttached===false`. Candidate's recorded public board immediately before its own turn-two Pass showed **Garbodor with zero Tool cards** versus the control's **Float Stone**. Other candidate turn-two Item/attachment actions remained recognizable: Powerglass, Escape Rope, Fog Crystal search for Psychic Energy, manual Psychic attachment, then Pass.

## Observed difference and limits

| Source-dealt arm | Candidate first-turn Field Blower | Garbodor Float Stone at candidate Pass | Candidate attacks over engine game | Engine terminal |
| --- | --- | --- | --- | --- |
| Pinned generic candidate policy | **No** (retains Field Blower, passes) | Equipped | **0** | Rank11 wins, 207 actions / 43 turns, prizes rank11/candidate **0/6** |
| Exactly one owner-valid response selection | **Yes** | **Removed** | **0** | Rank11 wins, 221 actions / 45 turns, prizes **0/6** |

**The previously unexecuted one-action hypothesis is now mechanically exercised**: the source-dealt held Item can target and remove the Tool on Garbodor. The intervention alone does **not** demonstrate meaningful strategic conversion. The pinned candidate policy subsequently attacks **zero** times in both complete engine reports, making winner comparison weak evidence. This record does not independently prove that Perfection became usable at the relevant moment, because the archived summary does not include the source Ability state after Tool removal. It also does not independently audit possible future Float Stone re-equipping or optimal response.

The fork is selected at a specifically known positive source decision and is **not an autonomous challenger policy**. Paper-rule fidelity, the Japanese source printing map, broader opportunity frequencies, independently competent opponent/candidate policies, and all remaining Top-32 matchups are not qualified. **Competitive games qualified: 0. No 99.5% win-rate evidence.**

## Next falsification

A separately versioned, actual **autonomous** candidate policy must recognize this public Garbotoxin Tool state across fresh source-dealt games and choose an owner-valid response without seed/turn scripts. It should record when Field Blower was absent or strategically deferred, monitor immediately possible Perfection, and audit the opponent's next actual retasking/retooling response. Test preregistered held-out seed/turn-order strata without selecting only the successful exposure arms. A policy that removes the Tool but still does not formulate a legal attack has solved only one edge of the problem.

**Reproduction:** [source response fork](../../simulation/twinleaf/newmoon-rank11-real-hand-blower-response.cjs), [manual-only workflow](../../.github/workflows/newmoon-rank11-held-blower.yml), [compiled successful run](https://github.com/FlareZ123/experiment-01/actions/runs/39098903560), [raw archived artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39098903560/artifacts/12125153547).
