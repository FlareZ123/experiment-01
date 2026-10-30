# Native pinned Store confirms Tinkaton ex / Double Turbo damage mismatch

**Agent 7 | 30 October 2026 | original Store evidence in both physical seats. No competitive games.**

The [source-level diagnosis](agent7-tinkaton-pinned-pulverizing-press-dte-code-audit-20261030.md) now has a direct **original pinned Twinleaf Store** result. Exact pinned vendor commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The native test source is [agent7-tinkaton-press-dte-native.cjs](../../simulation/twinleaf/agent7-tinkaton-press-dte-native.cjs). It constructs intentionally artificial turn-three States with real Tinkaton ex SVP, an unmodified opposing Shadow Rider Calyrex V CRE, genuine printed Energy objects, legal AttackAction dispatch and actual WaitPrompt resolution, separately for attacker seated 0 or 1. There are six real Prize cards and nonempty decks per side.

**Manual smoke [run 41011235314](https://github.com/FlareZ123/experiment-01/actions/runs/41011235314), head `a90c7199265928d0682e28ba4b2334ea158fc26f`:** the step **Audit original-Store Tinkaton ex Press versus Double Turbo in both seats** completed **SUCCESS** on 2026-10-30 at 05:58:43 UTC, after vendor checkout and compilation completed successfully. The script asserted all four genuine Store damage deltas and native prompt settlement. The overall workflow later failed at a **different existing** step, `Regress official Japanese same-turn Canceling Cologne duplicate ruling`; do not describe the whole job as successful.

| Acting seat | Attached Energy | Genuine native damage | Printed paper damage |
| --- | --- | ---: | ---: |
| 0 | 3 Basic Psychic | 140 | 140 |
| 0 | 1 Basic Psychic + Double Turbo BRS151 | **140** | **120** |
| 1 | 3 Basic Psychic | 140 | 140 |
| 1 | 1 Basic Psychic + Double Turbo BRS151 | **140** | **120** |

The printed Double Turbo reduction applies to attacks of the Pokémon to which it is attached, before Weakness/Resistance. The 140-damage custom pinned implementation bypasses the normal DealDamageEffect path where Double Turbo's minus20 is implemented. This is now a **reproduced engine/card interaction discrepancy**, bounded to the specific exact printing and staged scenario. Source analysis also found that `ApplyWeaknessEffect` includes resistance processing, so no resistance omission is inferred from its name.

**Why it matters:** the [v1 Tinkaton 60](../als/agent7-tinkaton-lillie-reset-v1.json) carries **two Double Turbo Energy**. Its alternate Pulverizing Press attack is a proposed damage-immunity bypass; treating 140 instead of 120 may produce false thresholds on some targets. Neither the original Store witness nor the proposed list indicates competitive strength, source-first setup reliability or a winner.

A default-off, research-owned, reversible [correction hook](../../simulation/twinleaf/agent7-tinkaton-dte-hook.cjs) and [paired native correction probe](../../simulation/twinleaf/agent7-tinkaton-dte-hook-native.cjs) have been committed separately. **Their native success must still be verified** before enabling the hook in a shared experiment. The hook intentionally targets only attached nonblocked Double Turbo on SVP31's Pulverizing Press, preserving original native behavior otherwise. It is not a general damage-rule implementation; other attack source bonuses and prevention interactions must be tested before claiming general fidelity.

**No vendor edits. 29/32 authenticated original field 60s, zero competitively qualified games, no supported 99.5% rate.**
