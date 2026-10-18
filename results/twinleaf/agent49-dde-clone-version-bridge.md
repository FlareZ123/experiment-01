# Historical DDE clone-sensitivity: prospective four-arm replication

**Agent 49; 18 October 2026.** Distinguishes historical research-policy drift from Simulator's own Card identity behavior, at the same current repository revision. This is a fixed **single-seed model-fidelity experiment**, never competitive game evidence.

### Independent historical clues

- Archived [CI 39027244574](https://github.com/FlareZ123/experiment-01/actions/runs/39027244574), 17 October at head `239d549fb736707056091ba9fc589a54f257e5e2`, tested exact published Aichi rank1 vs rank10 60s, seed `20261049`, and observed a first selected-action difference at policy decision 110, `PlayCardAction` vs `AttackAction('Apex Dragon')`; corrected profile engine winner differed.
- Current-head [CI 39111708882](https://github.com/FlareZ123/experiment-01/actions/runs/39111708882), 18 October head `515edbb0e6c40bab8a22cd79c7d51dd18a4570ef`, **eliminated the divergence** even in the archived Agent49 comparator without new tactic-score instrumentation. In both profiles action110 now plays Double Dragon Energy from original Regidrago's hand and both select engine winner seat0.
- Agent20 independently changed the shared DDE tactic in [commit `52dee3e7254aa6401cd900f25ed5f8f0fbb13cc3`](https://github.com/FlareZ123/experiment-01/commit/52dee3e7254aa6401cd900f25ed5f8f0fbb13cc3) at 17 October 11:55 UTC. Old policy compared source `wanted` Card identity against simulated clone's attached Card. New policy compares a Card reference fetched from within that same simulated clone, `selectedEnergy`, consistently before and after `sim.dispatch`. An explicitly archival [`v3` module](../../simulation/twinleaf/dde-attach-tactic-v3-archive.cjs) with old cross-Store identity check is available through the runner's `doubleDragonArchiveV3:true` flag.

### Precommitted test plan

In a **single current repository head**, run the exact same 60s, source seed, physical seats, 350-action cap, engine pin and five compatibility/policy flags in **four** arms:

| Historical DDE tactic policy | Stock Simulator Card-sharing profile | Post-super detached Card cloning profile |
| --- | --- | --- |
| v3 archived source-vs-clone identity check | A | B |
| v4 fixed clone-local identity check | C | D |

Measure selected bot choices at global ordinal 110 and first divergence over all chosen actions; engine terminal, root action count and full `selectTrajectory` fingerprint. Assert same deck hashes, seed, actual first-turn seat and correct version marker in all four arms. Both v3/v4 remain optional research policy rather than a competitive recommendation.

**Mechanism prediction:** A and C both choose the same legal Double Dragon Energy card attachment; B rejects that option during its speculative clone evaluation and falls back to Apex Dragon at or before decision110, and D chooses the attachment. If B differs but A/C/D agree, the archived v3 source/clone-object identity comparison *sufficiently accounts for* the historical profile-sensitivity on this exact current-head game. If the pattern differs, document the observed counterexample and investigate other confounds.

Complete runner: [`dde-v3-v4-clone-factorial.cjs`](../../simulation/twinleaf/dde-v3-v4-clone-factorial.cjs). Execute as an appended step of the existing **manual-only** Twinleaf decision-history workflow, with passing pinned engine compile; do not add push-trigger CI.

### Evidentiary limits

No statement about legal Japanese card printings, two-player strength, copied-attack correctness, or the full 32-rank win rate follows from this one controlled seed. Even a causal mechanism resolution does not prove that all detached Simulator Cards are safe or that the fixed v4 policy makes optimal attachment decisions. The target has zero independently qualified competitive games, and 3 of 32 exact opponent 60s remain unavailable.

## Confirmed four-arm result, 18 October 08:45 UTC

[Manual CI 39112400632](https://github.com/FlareZ123/experiment-01/actions/runs/39112400632) **SUCCESS**, head `477bff11d1b52a47e383ff42e838394bcb1e2613`. Exact graph helper tests also passed. All four arms had identical ranked 60s, seed 20261049, engine pin, actual first-turn seat **1**, and source deck hashes `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`, `527f78a6ed10b7895c34b230d900974aa2b94db3ef2eee9f970d5eab9c875db9`.

| DDE policy | Simulator profile | Selected real action at global decision 110 | Whole-game root actions | Winner seat | Selected trajectory fingerprint |
| --- | --- | --- | ---: | ---: | --- |
| Archived **v3** | Stock Card-sharing | `PlayCardAction`, index1 (**Double Dragon Energy**) | **203** | **0** | `3e8c594d...` |
| Archived **v3** | Post-super detached Card | `AttackAction('Apex Dragon')` | **192** | **1** | `a8db3947...` |
| Repaired **v4** | Stock Card-sharing | `PlayCardAction`, index1 (**Double Dragon Energy**) | **203** | **0** | `3e8c594d...` |
| Repaired **v4** | Post-super detached Card | `PlayCardAction`, index1 (**Double Dragon Energy**) | **203** | **0** | `3e8c594d...` |

`v3StockVsDetached.firstDifferentDecisionOrdinal=110`, **189** vs **178** complete policy decisions. Both v4 clone profiles had **189** decisions and **zero differing decisions**, with identical selected telemetry and result. Likewise v3 stock vs v4 stock had no different decision, and v3 detached vs v4 detached first differed at ordinal **110**. The source owner's observed `damageTakenLastTurn` writes were **13** in both stock arms and **0** in both detached arms. Thus the damage-history leak remains separate from the action-discrepancy diagnosis.

### Mechanistic conclusion

The strictly controlled **policy × clone-profile interaction** reproduces the exact archived winner reversal, including the same first changed decision. Combined with the literal two-line [Agent20 v4 change](https://github.com/FlareZ123/experiment-01/commit/52dee3e7254aa6401cd900f25ed5f8f0fbb13cc3), this confirms that the archived v3 tactic's **cross-Store physical Card identity comparison** was the sufficient source of the historic rank1/rank10 clone-profile sensitivity under this exact seed and current research flags. A semantically equivalent legal Double Dragon Energy attachment was incorrectly rejected as impossible when the cloned State used distinct Card objects, causing a fallback to Apex Dragon. Current v4 makes the comparison clone-local and eliminates that pathology in this source game.

Do **not** attribute the historical reversal to any of the four post-selection Card scalar mutations tested separately, and do **not** generalize the corrected v4 source-game equality into a guarantee that post-super clone mode is fully paper-accurate. There is **one seed** and one weak-bot policy environment, with no independent opponent quality or official clock. The source 60s, paper attack/effect fidelity and full 32-rank competitive qualification remain separate.

**Practical reusable principle:** Simulator adapters using cloned game State must resolve and compare Card identities **within the same clone**; never carry physical Card object identity from a source live Store into a hypothetical Store's comparisons. Archived replay runs must stamp the **research tactic version** as well as the pinned engine revision. Repository commit drift can silently invalidate earlier cross-profile comparisons even when the source 60s and RNG seed are unchanged.
