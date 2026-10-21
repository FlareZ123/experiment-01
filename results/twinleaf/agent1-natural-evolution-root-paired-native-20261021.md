# Native paired actor evolution opt-in: four changed typed roots on frozen source deals

**Agent 1 | executed 21 October 2026, ~01:38–01:42 UTC | evidence class: actual compiled pinned Twinleaf development decisions with frozen historical Aichi 60s and native actor-policy root audits.** Not a competitive match test.

## Exact reproduction and bounded design

- [Canonical manual GitHub Actions run 39528499252](https://github.com/FlareZ123/experiment-01/actions/runs/39528499252); complete baseline/opt-in and canonical-runner JSON archived in [artifact 12315115357](https://github.com/FlareZ123/experiment-01/actions/runs/39528499252/artifacts/12315115357), ZIP SHA256 digest reported by Actions: `a64ccf598102a401d7cca323ad1c309078d2b1e946db5cdc725bb32fa089bbf2`. The workflow **succeeded**.
- Frozen checkout head: `529a12991c2737037b574efd8f08e47b748acdc3`. Pinned vendor: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Compiled with GitHub Actions Node 22.
- Entrypoint: [four-arm paired census](../../simulation/evaluation/agent1-missed-evolution-pass-census.cjs) under `audit_missed_evolution=true` in the [manual canonical workflow](../../.github/workflows/agent7-canonical-actor-bilateral.yml). Two independent Node processes used the **same** checkout and source registration. Variant differed only in `AGENT1_NATURAL_EVOLUTION_ROOT_DEV`: false or true. Frozen other runner switches: canonical actor composition, mandatory-option gate, paper Supporter guard, rank-specific native pressure witness and read-only generic fallback attribution. No owner single-search, hand-discard, special Energy, Quick Ball or alternative Basic recipient opt-ins were used in the paired panel.
- The workflow asserted four attempted historical rows in *each* condition, zero competitive-qualified games, and equality of both trials' source-deal fingerprints and actual starter seats at each original candidate arm index. These paired physical-source and seat assertions **passed**. The historical registration includes source rank6 repeat0/seatA and source rank11 repeat2/seatB, each facing the unchanged champion-reference and New Moon Lockbreaker candidate 60s. These were *previously chosen development seeds*, not fresh performance sampling.

## Actual root-selection census

The reported values below come from `root.typedIntentCounts` in the **actual native canonical actor policy audit**. They are selected typed action roots, rather than independent game wins. `Evolve` is `evolve-pokemon`; Att = native Basic Energy attachments; Atk = attack declarations; Pass = turn passes; Bench = played Basic Pokémon.

| Exact source rank : candidate | Evo OFF: Bench / Att / Pass / Atk / Evolve | Evo ON: Bench / Att / Pass / Atk / Evolve |
| --- | --- | --- |
| 6 : rank1 champion | 0 / 2 / 2 / 1 / **0** | 0 / 2 / 2 / 1 / **0** |
| 6 : New Moon | 5 / 3 / 44 / 4 / **0** | 5 / 3 / 44 / 4 / **1** |
| 11 : rank1 champion | 6 / 13 / 6 / 43 / **0** | 6 / 9 / 6 / 46 / **2** |
| 11 : New Moon | 6 / 6 / 12 / 39 / **0** | 6 / 6 / 12 / 38 / **1** |

Under the default policy, **0** natural evolution roots are selected. Under the isolated opt-in, **4** are selected across **3 of 4** original arms, with source fingerprint and starting seat matched. This directly refutes any assumption that ordinary evolutions are irrelevant to the current frozen scenarios. The root actions and subsequent choices change, so the two paths cannot thereafter be interpreted as identical world trajectories. Nothing in these aggregate rows proves that the evolutions produced a favorable Knock Out, reduced Prize count, were the best decision, or improved win rate.

The `Fail closed on missing actor audits` step in the same job succeeded for the standard canonical run; paired outputs separately enforce the original four trials and matched source fingerprints. Their typed-intent counters alone do **not** provide per-evolution public stack mutations or fully authenticated attack followups. A subsequent targeted native observation must record the actual V -> VMAX or Duskull -> Dusclops stack transition and its timestamp.

## Important defect detected after this execution

The first **read-only extra observer** in this artifact reports `realPassRoots=0, eligiblePassRoots=0` in both paired conditions. **Those two values are INVALID**: the observer incorrectly looked for `PassTurnAction.id`, whereas the pinned [native PassTurnAction](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/actions/game-actions.ts) uses `clientId`. Its fake test had replicated the mistaken field and consequently failed to falsify the adapter. The actual separate actor-policy `typedIntentCounts` above uses its own instrumentation and is unaffected.

After finding this mismatch, I updated the [reversible observer](../../simulation/twinleaf/agent1-native-evolution-opportunity-audit.cjs) to version **v2**: match `action.clientId`, include both `PassTurnAction` and `AttackAction` because either can terminate an evolution opportunity, and update the fake-native tests to use the exact pinned action constructor shape. The [census entrypoint](../../simulation/evaluation/agent1-missed-evolution-pass-census.cjs) and [workflow](../../.github/workflows/agent7-canonical-actor-bilateral.yml) now emit `auditedTurnEnds` and compare source fingerprints. **Those v2 changes are later than the successful paired run and have not been given a new compiled/native execution in this report.** Do not use the stale v1 read-only zero counts for policy evaluation.

## Next gate and qualification

Run the patched v2 observer once on this fixed historical pair to measure accepted terminal actions with an owner-visible held evolution, and explicitly witness which evolutions become face-up in play when enabled. Keep the same original errors and cutoffs. Then advance to prospective, source-first, full-policy actor-only games and validate the opponent decisions; four old censored arms are insufficient to compare the champion against New Moon. Also address the independently proven conditional first-attack failure for [Mega Absol and Girafarig](agent1-mega-absol-known-dead-first-attack-20261021.md) before evaluating rank11 and similar sources.

**Benchmark remains 29/32 exact opponent lists, 0 competitively qualified games, no demonstrated 99.5% fixed deck.**
