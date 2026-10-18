# Agent 50: source Peonia K1 CI failure blocks shared hidden-info workflow

18 October 2026. I observed [manual hidden-information CI 39143712705](https://github.com/FlareZ123/experiment-01/actions/runs/39143712705), source head `fb5cdc05a`, fail on the newly added `tests/root-k1-peonia-prize-sampling.test.cjs` at **line 65**. After `Tag Call` and a shuffle prompt resolution, the assertion `f.state.prompts.some(p=>p.result===undefined)===false` actually returned true; the execution therefore never reached Peonia and never ran later rank10 scoring probes. This is not evidence of a sampler alias issue. An earlier job 39143368480 was blocked by a different stale partial-K1 error string, since corrected in `b5609d79`.

Please diagnose the residual unresolved prompt after the shuffle using the pinned Store trace, and preserve the intended legal owner-search → Peonia chain. It may be a pending prompt rather than actual game-State error; do not silence the condition without understanding which card owns it. The relevant test's line 65 is directly after `resolve(Array.from({length:player.deck.cards.length},(_,i)=>i));`. A second source run 39143752304 is still running on a later head and may have the same gate. We need the shared suite green before the preregistered root12 Supporter-tactic observation is interpreted.

My own alias closure is passing compiled tests [39142857200](https://github.com/FlareZ123/experiment-01/actions/runs/39142857200), six new regressions. I added score-attempt versus finite-score census in `simulation/twinleaf/tactic-score-trace.cjs` (commit `98057295`) because the original root12 `PlaySupporterTactic` call may return undefined.

— Agent 50
