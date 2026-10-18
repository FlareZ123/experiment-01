# Source root 133 DDE retarget: extra nominal Apex coverage, worse actual source result

**Agent 8, 18 October 2026 UTC.** A fixed-source, physically legal single-decision counterfactual within Agent20's simplified `DoubleDragonAttachTactic-v4` rank-10 source-first match. It tests whether diverting a real in-hand Double Dragon Energy from an Active Koraidon ex to an already double-Grass-equipped Benched Regidrago VSTAR improves the real bot-engine continuation. This test found a **negative result** on the one tested source deal. It is not competitive matchup evidence.

## Provenance and invariants

- Printed **rank1 Shadow Rider** engine slot A versus **rank10 Regidrago** engine slot B, Regidrago actually first, seed **4246551499**, original unchanged two 60-card lists in [published field](../aichi-2026/full-decklists.json).
- [Successful full manual CI 39084778201](https://github.com/FlareZ123/experiment-01/actions/runs/39084778201), commit `4daddf2501a23f410fb8da2b07e60b9b95eca75e`; [machine-readable fork artifact 12120366139](https://github.com/FlareZ123/experiment-01/actions/runs/39084778201/artifacts/12120366139), ZIP SHA-256 `603e96f02e01e39ee00151a6b04dbc3ec2ec32c6c75c60d173951567c9e98f4c`. Pinned `vendor/twinleaf` revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Script [`dde-v4-first-seat-apex-bench-fork.cjs`](../../simulation/twinleaf/dde-v4-first-seat-apex-bench-fork.cjs) checks **real source Store root 133, global turn27**, actor 202, own Active **Koraidon ex TEF**, own Bench index5 **Regidrago VSTAR SIT with two Grass Energy MEE**, one in-hand Double Dragon Energy ROS and no unresolved prompts. [Pure guard tests](../../tests/dde-v4-first-seat-apex-bench-fork.test.cjs) and full compiled run passed.
- Fork directly supplies the alternative `PlayCardAction` before calling the bot's original `decodeNextAction` at that root, avoiding contamination from its immediate speculative choice. All later calls use the same baseline policy. Source Store action prefix and **pre-choice physical zone digest** were equal: `c0ad924634e982b1147577cf3189563f5f7f03bc06185ee57d9c17174c0b9a56`. One intentional change at root133 only. Unmodified control, fork, unmodified repeated control; both controls reproduced runner digest `fa9c8c213beefb3164f24add23f0ca8eebe95431347d23ab872a78df8ef4f019`.
- The source actually attached DDE to **Active Koraidon ex**, with target `{player:2,slot:1,index:0}`. The alternative actually attached DDE to **Benched Regidrago VSTAR**, target `{player:2,slot:2,index:5}`. Both physical postdispatch Energy assignments were positively asserted; no staged or injected cards.

## Observed actual-Store continuations

| Same source state, one root 133 action | Regidrago's own attacks | Full engine completion | Remaining Prize cards (rank1, rank10) |
| --- | --- | --- | --- |
| Original: attach DDE to Active Koraidon | Turn27 **Retribution Strike**, turn29 **Kaiser Tackle** | Rank1 wins, 211 root runner actions, **turn38** | **[0,3]** |
| Counterfactual: attach DDE to Benched two-Grass Regidrago VSTAR | No immediate turn27 attack; later turn35 **Regidrago V Celestial Roar** only | Rank1 wins, 189 root runner actions, **turn36** | **[0,6]** |

At the immediate changed decision, the alternative moved three Energy cards onto the Benched VSTAR, including the DDE; its **next real root action 134 was PassTurnAction**. In the control, the next root134 was Koraidon's AttackAction, consuming its available attacking turn. The two finished outputs were observed with the corrected nested transcript unwrap; both included a concrete terminal winner, action count, turn count, complete candidate attack summary and Prize counts.

The alternative produced an *apparently payable* Apex Dragon cost on a **Benched** VSTAR, while the unpowered Active Koraidon ex could neither use its normal two-Colorless attack nor retreat without an independent switch/reposition route. Source-rank10 contains two Guzma and a Latias ex with potential mobility roles, but access, legal timing, availability and continuation must be separately established. This illustrates **Active-position and multi-action contention**: an Energy placement can look superior in isolation and degrade realized progression when a follow-up Active promotion is unavailable or ignored. The observed loss of three earned Prize cards under the bot is a source-specific result, not a proof that alternative placement is always worse.

## Methodological correction

An earlier run [39084437560](https://github.com/FlareZ123/experiment-01/actions/runs/39084437560) compiled and correctly verified the exact root fork and attached-Energy location, but an output-only **nested `{result:{result:match}}` unwrap error** summarized the transcript wrapper instead of the completed alternate match. Its artifact lacked `finished`, winner and turns for the alternate and must **not be cited for a terminal comparison**. Fixed in commit `7d223a15` by unwrapping the actual `runMatch` payload and commit `4daddf25` by requiring a boolean `finished` plus `endReason`. Full corrected CI 39084778201 validates the above terminal data. This is a caution against treating a successful source-action fixture as proof that its serialized outcome field points at a real match result.

## Research implications and next falsification

The v4 DDE tactic's Active-first attachment priority is a legitimate local decision opportunity but cannot be corrected simply by always prioritizing an energetically ready Benched VSTAR. Future policy should evaluate a **feasible attack line across Energy attachment, Active mobility, Supporter contention and opponent response**, with exact current hand and attached Energy visibility and without hidden-deck foresight. A promising bounded follow-up is to inspect the real own hand and Supporter channel at root133, then test an observed affordable Koraidon-to-VSTAR switch, if one exists, within the same preaction source state.

Nothing here certifies hidden-information fairness, source-state clone semantics, critical paper rules, realistic competitive policy or unseen-seed results. **`sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`; zero qualified competitive games remain.**
