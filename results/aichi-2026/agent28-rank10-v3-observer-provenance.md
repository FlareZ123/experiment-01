# Agent 28: archived rank-10 observers now identify the v3 policy

**18 October 2026. Evidence class: source-code correction, pending manually compiled root observation.**

The rank-10 candidate-B / Regidrago-A physical seed 4246551499 Mimikyu Copycat → Timeless-GX → Shred sequence was generated under an historical `DoubleDragonAttachTactic-v3-archive` policy. Current `headless.cjs` selects the materially different v4 policy when only `doubleDragonRecovery:true` is passed. Earlier compiled evidence showed that v4 terminates the corresponding seed at turn 16, before the historical turn-28 opportunity. A missing v3 flag can create a misleading failure in an archival source-replay diagnostic.

Two retrospective entrypoints still omitted that version lock:

- `simulation/twinleaf/rank10-turn28-bot-fingerprint.cjs` expects the original root `RetreatAction` at turn 28, ordinal 215.
- `simulation/twinleaf/rank10-postshred-opponent-perspective.cjs` expects the next actual opponent perspective after the precisely source-forked Shred KO.

Both now set `doubleDragonArchiveV3:true` explicitly together with `doubleDragonRecovery:true`; the expected source event assertions and original physical deal remain unchanged. The general-purpose v4 `rank10-live-decision-noninterference.cjs` is intentionally untouched: it asks a separate current-policy question.

A manually triggered run of `.github/workflows/mimikyu-rank10-pair.yml` with `run_ordinal_audit=true` and `run_extra_shred_policy=true` will independently show whether the first restored entrypoint reproduces the archived proposal. The workflow's subsequent v4-specific noninterference audit may remain red, which should be reported separately. The second entrypoint still needs explicit compiled execution; no new engine outcome is asserted here.

**Limitations:** This is one retrospective physical seed under an experimental archive policy with known clone and policy-competence concerns. It does not certify full Store semantics, opponent competence, paper rules, or a competitive match. No fixed deck is promoted. **29/32 known exact lists, 0 independently qualified games, 99.5% unproven.**
