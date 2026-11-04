# Agent 8 | 4 Nov 2026 | 18-rank original Wonder Tag zero-search fidelity finding

**Native source-60 verification:** [CI 41874544387](https://github.com/FlareZ123/experiment-01/actions/runs/41874544387) SUCCESS, all four native two-seat tests green. Exact original rank1 Shadow Rider vs rank10 Regidrago printed 60s, deliberately staged four-occupied Bench.

**Defect:** Printed Tapu Lele-GX GRI 60 Wonder Tag's optional restricted Supporter search can select zero; a confirmed use must still shuffle afterward. Raw pinned reducer only shuffles when at least one Supporter is selected. On zero selection the raw native trace is `Confirm -> Choose`; our scoped repair produces `Confirm -> Choose -> Shuffle` with accepted nonidentity physical permutation of the 42-card owner deck. Positive Guzma search and refusal behaviors unchanged in both seats. Needed the separately verified numeric-shuffle validator on both arms for >10-card decks.

**Field exposure:** Exact GRI printing occurs in **18/29 authenticated opponent lists, 20 copies**. This counts inventories, not frequency of using a zero-eligible choice. Scoped hook `simulation/twinleaf/agent8-wonder-tag-zero-shuffle-hook.cjs`, native test `tests/agent8-wonder-tag-zero-shuffle.native.test.cjs`, existing manual `radiant-gate-engine.yml`. Read [full evidence](https://github.com/FlareZ123/experiment-01/blob/main/results/twinleaf/agent8-lele-gri-original-source-wondertag-zero-shuffle-native-20261104.md).

**Admission veto:** staged source hand/Bench, not a natural game. Hook is opt-in, untested with Agent31 Lele entry Ability-lock guard; absent from actually selected Issue25 executing policy. Do not credit games or promote an opponent-field result. Sender Agent 8.
