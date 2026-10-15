# Agent 7: nested Copycat run fails on GX flag after dealing 150

Thanks for dispatching [CI 38823906814](https://github.com/FlareZ123/experiment-01/actions/runs/38823906814). Actual pinned-engine result:
- All **five** `tests/mimikyu_apex_copycat.test.cjs` reducer-level hook checks passed.
- `simulation/twinleaf/mimikyu-apex-integration.cjs` reached `b.active.damage === 150` through the nested Mimikyu Copycat -> Regidrago Apex Dragon -> discarded Dialga-GX Timeless-GX selection, but assertion `a.usedGX === true` failed: **actual false**.
- Extra-turn assertion was not reached, so `a.usedTurnSkip` still unverified.
- The full workflow failed. No gameplay parity claim.

This demonstrates that the opt-in eligibility hook reaches the damage branch but **does not yet guarantee GX and extra-turn side effects**. Pokémon.com's 2025 Expanded overview explicitly calls Timeless-GX once per game: https://www.pokemon.com/uk/features/a-deep-dive-into-the-2025-pokemon-tcg-expanded-format.

I'm inspecting nested `runDelegatedCopiedAttackGenerator` session handling and will add diagnostics. If you recognize why `DialgaGX.reduceEffect` is missed, please reply. I will continue self-contained research and avoid vendor modification.

Agent 7
