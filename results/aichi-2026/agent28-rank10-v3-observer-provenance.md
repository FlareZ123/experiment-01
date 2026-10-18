# Agent 28: archived rank-10 observers now identify the v3 policy

**18 October 2026. Evidence class: source-code correction, pending manually compiled root observation.**

The rank-10 candidate-B / Regidrago-A physical seed 4246551499 Mimikyu Copycat → Timeless-GX → Shred sequence was generated under an historical `DoubleDragonAttachTactic-v3-archive` policy. Current `headless.cjs` selects the materially different v4 policy when only `doubleDragonRecovery:true` is passed. Earlier compiled evidence showed that v4 terminates the corresponding seed at turn 16, before the historical turn-28 opportunity. A missing v3 flag can create a misleading failure in an archival source-replay diagnostic.

Two retrospective entrypoints still omitted that version lock:

- `simulation/twinleaf/rank10-turn28-bot-fingerprint.cjs` expects the original root `RetreatAction` at turn 28, ordinal 215.
- `simulation/twinleaf/rank10-postshred-opponent-perspective.cjs` expects the next actual opponent perspective after the precisely source-forked Shred KO.

A follow-up repo-wide sweep found three additional explicit historical root-215/231 consumers with the same v4-drift error: `rank10-shred-turn29-response-source.cjs`, `rank10-turn29-hidden-order-source.cjs`, and `rank10-shred-policy-rng-aligned.cjs`. All five programs now select `doubleDragonArchiveV3:true` together with `doubleDragonRecovery:true`. The indirectly dependent `rank10-shred-turn29-own-hand-source.cjs` inherits the corrected response source. The archived game seed, printed 60s, observed action assertions and original source-State fingerprints remain unchanged. The general-purpose v4 `rank10-live-decision-noninterference.cjs` is intentionally untouched: it asks a separate current-policy question.

A manually triggered run of `.github/workflows/mimikyu-rank10-pair.yml` with `run_ordinal_audit=true` and `run_extra_shred_policy=true` will independently show whether the first restored entrypoint reproduces the archived proposal. The workflow's subsequent v4-specific noninterference audit may remain red, which should be reported separately. The second entrypoint still needs explicit compiled execution; no new engine outcome is asserted here.

**Compiled confirmation:** [Manual CI 39136124114](https://github.com/FlareZ123/experiment-01/actions/runs/39136124114), exact head `b148a0ef2ab80ac1926a1ef26fe90b8cbed80c45`, **passed the entire manual workflow**. Its optional source tests successfully compiled Twinleaf and executed the corrected historical `rank10-turn28-bot-fingerprint.cjs`, source Shred full-game policy fork, and the direct-ordinal bypass comparison. This is runtime verification of the restored original turn-28 root proposal and source-fork replay, not a fresh trial or independent policy-competence test. The later added three turn-29 and RNG source-policy corrections and standalone opponent-perspective observer were *not* present in that earlier head.

**Second validation in progress:** [Manual CI 39136768328](https://github.com/FlareZ123/experiment-01/actions/runs/39136768328), launched with ordinal, RNG, and turn29 response flags on a newer main head, is intended to check the expanded five-entrypoint correction, new source-wiring guard, and transitive response observers. Preserve any individual failing step as a concrete regression and do not infer results before completion.

**Limitations:** This is one retrospective physical seed under an experimental archive policy with known clone and policy-competence concerns. It does not certify full Store semantics, opponent competence, paper rules, or a competitive match. No fixed deck is promoted. **29/32 known exact lists, 0 independently qualified games, 99.5% unproven.**
