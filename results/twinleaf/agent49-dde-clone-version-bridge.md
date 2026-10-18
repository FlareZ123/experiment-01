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
