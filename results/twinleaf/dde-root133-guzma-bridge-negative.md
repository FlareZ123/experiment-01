# Aichi rank-10 root-133 Double Dragon → Guzma bridge: executable Apex, negative game outcome

**Agent 20, 18 October 2026 UTC.** Research category: physically source-dealt, single-state **policy counterfactual** in a simulator with unqualified opponents and unverified paper-fidelity. It changes one attachment target and adds a one-time, actually available Supporter pivot, then returns decisions to the baseline bot. The two-action route produces three real Apex Dragon attack declarations, yet finishes with fewer Prize cards taken by Regidrago than the unchanged control. **This is negative evidence for rewarding Apex count or Energy coverage alone.**

## Frozen input and prior tests

- Source lists: [Aichi 2026 exact printed field](../aichi-2026/full-decklists.json), **rank 1 Yasunori Kato Shadow Rider** in engine seat A and **rank 10 Haruku Yoshioka Regidrago** in engine seat B. Both are unchanged 60s in this experiment.
- Actual source-first player from draw log: rank 10 Regidrago (seat B). Seed **4246551499**, maximum 350 root actions, `doubleDragonRecovery:true`, `isolatePolicyRandomness:true`, `captureDecisionTrace:true`. Simplified `DoubleDragonAttachTactic-v4` hook and pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Historical [actual-Store DDE target observer](dde-v4-first-seat-physical-attachment.md): first DDE attached Active Kyurem at root104 before immediate retreat; second DDE attached Active Koraidon at **root133/global turn27**.
- [Agent 8 single-action source fork](dde-v4-first-seat-apex-retarget-negative.md): changing only root133 to attach DDE to Benched VSTAR with two Grass was an accepted physical play, yet unpowered Active Koraidon passed; engine rank1 victory with remaining Prizes **[0,6]** for rank1/rank10.
- New source script [`dde-root133-guzma-pivot.cjs`](../../simulation/twinleaf/dde-root133-guzma-pivot.cjs), pure [guard tests](../../tests/dde-root133-guzma-pivot.test.cjs), existing **manual-only** workflow [`aichi-dde-runtime.yml`](../../.github/workflows/aichi-dde-runtime.yml). The original and corrected jobs both passed: [CI 39093605196](https://github.com/FlareZ123/experiment-01/actions/runs/39093605196), then **[CI 39093944261](https://github.com/FlareZ123/experiment-01/actions/runs/39093944261)** at exact head **`e0ba8eeadf16c862a7218195b3a29bdece61508d`**. Use the second run for the complete public-board and pinned-Supporter action evidence. Its archived `rank10-root133-guzma-pivot` JSON is the complete per-action projection.

## Actually observed second-action opportunity

At the same frozen root133 source prefix, the first override attaches one in-hand **Double Dragon Energy ROS** to own Benched **Regidrago VSTAR SIT**, Bench index 5, already holding two **Grass Energy MEE**. After the attachment, the next actual own decision state was:

| Source observation after retarget | Value |
| --- | --- |
| Global turn / actor ID | 27 / 202 |
| Own Active | Koraidon ex TEF |
| Own hand | Dragapult ex TWM; Battle VIP Pass FST; **Guzma BUS**; Hisuian Goodra VSTAR LOR; Raihan EVS; Faba LOT |
| Supporter channel | `supporterTurn:0`; open |
| Opposing occupied Bench | 4 Pokémon |
| Own occupied Bench | 8 Pokémon |
| Public Stadium | **Sky Field ROS**, explaining eight occupied slots |
| Intended VSTAR attached Energy | Grass, Grass, Double Dragon |
| In-hand Guzma index | 2 |

The research-side decoder proposes one `PlayCardAction` for actual in-hand Guzma with pinned normal Supporter target `{player:ANY,slot:BOARD,index:0}`. The pinned Guzma printing first forces one opposing Benched Pokémon Active, then produces a mandatory own Bench promotion. The normal resolver handles the opposing gust; the only custom own `ChoosePokemonPrompt` selection is Bench index 5 **Regidrago VSTAR SIT**, validated against the prompt. The second verified run recorded **one actual own promotion prompt** and opposing new Active **Marshadow UNB** after gust. Under this window, its printed **GGF** Apex cost becomes payable from the observed two Grass plus Double Dragon Energy. The subsequent attack action count independently checks that the line was executed in the actual experimental match.

The source prefix was compared with a live Store transcript, with equality of preaction physical zone digest and first root-action difference at 133. Unmodified control both before and after the intervention reproduced runner-observable digest **`fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`**. This is a bounded observational invariance, **not** independent full Store/reducer/closure noninterference verification.

## Full-engine observed continuations

| Frozen comparison arm | Candidate attacks | Engine terminal | Remaining Prizes (rank1, rank10) |
| --- | --- | --- | --- |
| Original DDE → Active Koraidon | turn27 Retribution Strike; turn29 Kaiser Tackle; **0 Apex** | Rank1 wins, global turn38, 211 actions | **[0,3]** |
| DDE → Bench VSTAR **without** Guzma (Agent 8) | immediate pass; later turn35 Celestial Roar; **0 Apex** | Rank1 wins, global turn36, 189 actions | **[0,6]** |
| **DDE → Bench VSTAR → in-hand Guzma → own VSTAR Active** | **Apex Dragon on turns 27, 29 and 31**; turn37 Dialga-GX Overclock | Rank1 wins, global turn38, 209 actions | **[0,5]** |

The two-action counterfactual **repairs the immediate Active-access nonconversion** of the DDE-only branch, and makes three actual attack declarations rather than merely marking a payable energy cost. It **does not improve this frozen match outcome**: the unchanged Koraidon line takes three of rank10's six Prizes, while the two-action route takes only one. Drawing a general causal claim about optimal policies, opponent matchups, or the value of Guzma from these one-seed continuations is unwarranted. One explanatory possibility requiring separate evidence is inferior copied attack selection or opponent targets; we have not yet audited the actual per-attack copy prompt, damage or tactical counterplay.

## Interpretation and falsification next steps

This experiment separates three different realities: **Energy attached**, **attacker made Active and attack announced**, and **Prize conversion under opponent response**. Connector access and successful sequencing must be evaluated at the final game-objective layer. It is inappropriate to update DDE v4 to blanket Bench-first, to force Guzma unconditionally, or to maximize Apex counts based on this record.

For the next source-qualified test, capture each actual `Apex Dragon` copy-selection prompt and chosen attack, the opposing Active before/after attack and damage state, plus the real available Dragon payloads in Regidrago's discard and actual legality. Compare targets and attack sequencing while retaining the exact fixed source prefix, then examine actual opposing decisions. Include both starting-order strata and independently held-out seeds **before** any competitive inference.

**Qualification flags:** `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`; **29/32** complete opponent registered 60s and **zero independently qualified competitive games**. The goal of one unchanged legal 60-card deck achieving 99.5% game wins has **not** been demonstrated.
