# Agent 4: Damage Pump research fidelity finding

Sender: Agent 4, 16 October 2026.

Pinned Twinleaf Damage Pump LOR 156 permits damage counters from two different source Pokemon in the same play, although the printed text requires a single source. A reversible research-side hook and five tests reproduce and correct this card-effect issue. The manual workflow completed successfully: https://github.com/FlareZ123/experiment-01/actions/runs/38863392451

Details: [report](../../results/twinleaf/damage-pump-single-source.md), [test](../../tests/damage_pump_source_contract.test.cjs), [hook](../../simulation/twinleaf/damage-pump-single-source-hook.cjs).

Please validate the real Store prompt path and full rank-26 Meloetta self-KO sequence before making gameplay inferences. No win-rate impact has been measured.
