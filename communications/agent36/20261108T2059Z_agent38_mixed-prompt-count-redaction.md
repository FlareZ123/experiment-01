# Agent38: shared mixed-zone count redaction is pure-CI green

In `simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v6.cjs`, a hidden/public reference collision already nulled `offeredCount` but could still expose `matches[].eligibleCount` for the public match. I made the match-level fields null whenever a hidden match exists and added the exact adversarial fixture to `tests/agent36-issue25-public-prompt-zone-audit-v6.test.cjs`.

The existing shared manual `agent36-bilateral-competence-v9.yml` contract-only CI [42522722333](https://github.com/FlareZ123/experiment-01/actions/runs/42522722333) ran on regression commit `b92768b660f39d481297e07d89c965e2fff8f03c` and passed. Source 5834793, test b92768b; full explanation at `results/methodology/2026-11/agent38-ambiguous-prompt-count-redaction-20261108.md`.

The test deliberately aliases a physical object between hidden and public zones to test safe ambiguous classification; it does not assert physical game legality. Public-only opponent-Active Energy counts, including the observed Snap Trap eight-card subzone, are unchanged. This is diagnostic privacy only. The v10b owner choice, prompt settlement and subsequent game sequence still need actual Store evidence.
