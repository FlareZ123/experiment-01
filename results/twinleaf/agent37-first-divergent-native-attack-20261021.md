# Agent 37: first differing actor-only printed attack, genuine Store settlement

**21 October 2026 UTC.** Same-checkout, same-source-deal, symmetric policy off/on replay. This is a bounded observational diagnosis of the native decision-policy confound. **Zero competitively qualified games.**

## Research question

Agent 49's [v2 discrete-safe potential-KO selector](agent49-public-discrete-attack-v2-native-20261021.md) produced different complete-game native outcomes with the exact same decks. Its report identified rank-11 source Mega Absol ex's Terminal Period versus Claw of Darkness and rank-11 candidate Girafarig's Get Lost versus Mind Shock as first changing actions, while warning that the **actual public defender state and native settled damage had not been independently documented at those roots**.

This experiment tests both first divergences directly against the real pinned Store and a detached, retrospective public attack-settlement observer. It also checks whether the full recorded native traces reproduce independent previous results.

## Protocol and provenance

- One unchanged canonical four-arm historical registration: rank-6 and rank-11 source deck 60s, each paired against the champion reference and New Moon fixed 60. Same original **rank-6 seed 407516727** and **rank-11 seed 623585882**, original physical source cards and starting order.
- The same actor-only composed policy, mandatory option handling, paper Supporter quota, native source-pressure scripts and any weak generic native fallback were applied to **both seats** in both arms. The only treatment variable was `AGENT49_POTENTIAL_KO_ROOT_DEV=false` versus `true`.
- [Read-only paired runner](../../simulation/evaluation/agent37-first-divergent-native-attack-pair.cjs) wraps the actual `headless.runMatch`, restores its hook and environmental flag, captures each successful native Store root ledger and calls [candidateAttackSettlement](../../simulation/evaluation/agent37-candidate-attack-settlement.cjs) with the *physical attacker's seat*. It locates the first divergent native accepted root, then checks the two branch-specific settled public game states at that same ordinal.
- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, canonical source provenance as defined in `results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json`.
- [Manual native CI run 39542707239](https://github.com/FlareZ123/experiment-01/actions/runs/39542707239) **passed** from same-checkout head `1519c8b0ff2f29cbf6b5963e9a2dfbb8f38eeb34`. [Raw JSON paired artifact 12320406690](https://github.com/FlareZ123/experiment-01/actions/runs/39542707239/artifacts/12320406690); ZIP `sha256:1e14746040c6c1928517addb3f046025f3291b5854dd14acdb160b1cd2144b9f`.

All **eight** native games were captured. All **four** control-versus-treatment pairs matched their exact source-deal fingerprints and actual starter seats. The root SHA256 of every whole-game record matches the canonical runner's corresponding SHA and the previously independently archived Agent49 off/v2 run artifacts. All four executions produced no Store test errors; no new fixed deck, card or paper-format assumption was introduced.

## First native accepted action divergence and immediate settled effects

| Historical source / candidate | First different accepted root | Action difference, OFF → ON | Identical public preattack board? | Original native settlement | New native settlement |
| --- | --- | --- | --- | --- | --- |
| Rank 6 / champion reference | None | Entire native root ledger identical | N/A | Identical 35-action engine terminal | Identical |
| Rank 6 / New Moon | None | Entire native root ledger identical | N/A | Identical 200-action engine terminal | Identical |
| Rank 11 / champion reference | **39**, global turn **7**, candidate physical seat **1** | Girafarig's **Get Lost → Mind Shock** | **Yes**; opponent Active Mega Absol ex at 0 damage | Active damage **0 → 0**, Prizes **6/6 → 6/6** | Opponent Active damage **0 → 70**, Prizes **6/6 → 6/6** |
| Rank 11 / New Moon | **146**, global turn **30**, source physical seat **0** | Mega Absol ex's **Terminal Period → Claw of Darkness** | **Yes**; opponent Active Duskull at 0 damage | Duskull damage remains **0**, Prizes **6/6 → 6/6** | **Duskull Knocked Out**, source Prizes **6 → 5**, Mewtwo & Mew-GX promoted |

Both rank-11 attack resolutions had actual Store attack declarations and complete settled prompt chains. The stricter `nextSourceSameEpochProven` was **true** for both branches of both divergent attacks. None of the four attack settlements crossed a native backward turn-clock reset. This gives direct evidence of immediate native settled damage and Prize changes under the two selected attacks.

At each first different action, the **entire accepted root-action history before the action was identical between arms**. The exact publicly exposed game boards were also equal before each attack. The changed attack selection is therefore the first documented native action difference at that branch point. The subsequent turn sequences diverged because the physical game states had changed.

## Full historical native trial outcomes (unqualified)

| Rank / candidate | OFF full game | ON full game |
| --- | --- | --- |
| 6 / champion reference | 35 actions, engine terminal, seat0 winner, Prizes `[4,6]` | Identical |
| 6 / New Moon | 200 actions, engine terminal, seat0 winner, Prizes `[2,6]` | Identical |
| 11 / champion reference | **260-action censored**, Prizes `[6,6]` | **260-action censored**, Prizes `[5,3]` |
| 11 / New Moon | **260-action censored**, Prizes `[6,6]` | **184-action engine terminal**, source seat0 winner, Prizes `[0,6]` |

These outcomes **depend materially on the attack-choice policy**. The historical terminal reversal is an observational fact about this fixed engine, opponent bot, source setup and retrospective seed. It is unfit for a Pokémon paper Expanded winning percentage: current source scripts, generic hidden-state native fallback, missing card-effect fidelity, tournament clock and original source-first opening remain unresolved.

The public board observations establish that a selector can redirect an accepted printed attack from zero immediate tactical effect to concrete damage or a Prize taken. They do not establish that the selector is globally best, or that these outcomes transfer to a competent match.

## Reproducibility checks and further needs

Complete control/off and treatment/on native root SHA256 values, in arm order:

| Arm | OFF SHA256 | ON SHA256 |
| --- | --- | --- |
| Rank6/champion | `6f471591b6b4de41a18ba9c0557644dc194a084ad2af14e48eecc6f70e66e334` | same |
| Rank6/New Moon | `414c088cdedbeb511dbeaec05bb26ad5c21a65b87f6a65b77d3abcf9e7c719c1` | same |
| Rank11/champion | `b55152340296c3e0c64baee895e669864cde83be1f949a67573a59bc892abf33` | `58e197fd42478f46ee2e2c8bb6cd222b6c04123a1c4efc26d085488ae4f191ca` |
| Rank11/New Moon | `d36f2d0cea103453dd7338363116ec9413eb43d1443e08b9e05ec202e36d1001` | `2872351870cb4d5d28f55e0eb9e240edbb7fa7412f2fdece4f19ee1b4f404c30` |

Prior source independent archives remain:
- [OFF baseline artifact, CI 39533177714](https://github.com/FlareZ123/experiment-01/actions/runs/39533177714/artifacts/12316311575)
- [Discrete-safe ON v2 artifact, CI 39534968464](https://github.com/FlareZ123/experiment-01/actions/runs/39534968464/artifacts/12316459092)

The operator should retain an identical two-seat policy and frozen full registered source 60 while evaluating any future prospective pairs. Re-run this diagnostic in **true source-first rank-11 pressure** when owner-visible policy competence and native lock settlement improve. Include the initial KO, the immediate next response and any later followup with full clock/epoch validation. Test evolving, protecting and retreating against source attack policy before promoting any fixed candidate.

**Project-wide status remains 29/32 verified exact field 60s, zero competitive-qualified games, and no demonstrated 99.5% fixed-list win rate.**
