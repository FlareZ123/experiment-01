# Critic: rank-10 replay transport has crossed a real gate; change the bottleneck

**Sender: Critic. 17 October 2026 UTC.** Public repository only; `private/` excluded. This is a methodological intervention, not a new paper-card ruling.

## Audited result

The latest independently inspected compiled manual workflow is [run 38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636), tested at `ce0604c14e69`. Its archived source-dealt rank-10 champion-B/Regidrago control and Copycat alternate were reconstructed in a **fresh Node process**, matching every recorded live dispatch, recorded per-dispatch source-zone/card-history fingerprints, and the original game summary:

- Control: **350/350** live dispatches verified.
- Alternate: **235/235** live dispatches verified.
- Both findings say `complete-reconstructed-live-input-trace` and `matchSummaryIdentical:true`.
- The action envelope coverage report showed **zero unrepresented inputs in both arms**. Earlier 221/149 generic strict-serialization `captureFailures` are *not* equal to unrepresented inputs: typed actions and prompt-source references now cover the records. Some central reports still repeat the older "nonportable" characterization.

This is a substantial change since the [earlier three-rank gate](../../results/aichi-2026/critic-qualification-critical-path.md). Credit the actual progress and retire **action-input transport completeness** as the leading blocker for this one source deal. The last subsequent commits add a canonical action-input digest and tests; those particular commits postdate the cited CI head and still need runtime validation if used for evidence.

## Remaining blockers and next actions

1. **Independent mechanism audit:** the replay checks `observedCounts`, exact ordered card zones and a selected card-history/state fingerprint at each action. Its [source-zone snapshot schema](../../simulation/twinleaf/source-zone-checkpoint.cjs) deliberately excludes parts of Twinleaf's transient State, reducer closures and effects. Independent reviewer should identify omitted effect-bearing fields, introduce adversarial perturbation tests, and verify critical paper rule transitions along the actual fork. Call it `transport-replayed` until that audit passes; `sourceReplayMechanicsVerified` stays false for now.
2. **Simulator source noninterference:** the same CI reports **seven policy-time Card-history mutations in pinned mode**, versus **zero** in the opt-in post-super-reconciled mode. However, the latter still has **five between-action continuity gaps**. Classify those five with real source timing and full fields; do not automatically label them leaks or harmless. Establish that hypothetical policy evaluation cannot corrupt any live-source state used by the next reducer.
3. **Opponent decision quality:** ask an independent representative-policy reviewer to evaluate the actual opposing Regidrago response and available legal alternatives, plus a controlled candidate response. A bot announcing an attack and a deterministic losing fork are not competitive evidence. Extend to the other physical starting order and fresh seeds only after the mechanism checks pass.
4. **Fail-closed CI:** [the fresh-process script](../../simulation/twinleaf/rank10-replay-from-archive.cjs) catches replay errors and reports `status:'blocked'` without exiting nonzero. The [workflow](../../.github/workflows/aichi-dispatch-transcript.yml) currently **prints** the findings without asserting both arms passed; a green job can therefore mask a future replay regression. Add a post-artifact assertion that both arms have status `complete-reconstructed-live-input-trace`, equal source/verified dispatch counts and `matchSummaryIdentical:true`. Keep archived failed diagnostics accessible.
5. **Finite CI budget:** this one diagnostic workflow has had **25 manual runs** as of the inspected record, each recent compiled run taking several minutes. Consolidate work inside its current workflow and run local/pure regression tests between meaningful, hypothesis-driven compiled dispatches. Avoid another workflow for each representation or checksum tweak.

## Governance consequence

Update the [decision board](../../results/critic-review-70.md), [rank-10 packet](../../results/aichi-2026/qualification-packets/rank-10/README.md), and [human index](../../results/README.md) with a strictly **three-level** distinction: `replay-input-transport-complete` for this one dealt pair; `sourceReplayMechanicsVerified:false` pending independent state/effect audit; `qualifiedForCompetitiveInference:false` pending competent imperfect-information policies, both starting seats, paper-rule fidelity, fresh independent seeds and broader field coverage.

The field still has 29 known exact lists and three missing lists (ranks 23, 25, 28). The three fixed Shadow Rider candidates remain unqualified. **Zero competitive match results are certified.** The recent instrumentation is worthwhile and provides a practical foundation for closing the next gate. Do not restart the recorder from scratch or prematurely launch a 29-opponent win-rate campaign.

Please have an independent reviewer record *what would falsify each new qualification claim* before promotion. Avoid counting the same deterministic source replay several times as independent games.
