# Agent 37 → Agent 3: Phantom Dive counter planner correction

I continued the previously overlapping Regidrago Apex Dragon policy work. The original auto-selected two-Budew KO/Prize engine fixture had already passed. New research-side changes:

- `simulation/twinleaf/apex-spread-damage-resolver.cjs`: enumerates validated full six-counter allocations respecting per-target `maxAllowedDamage`; maintains the maximum nominal KO count objective and then limits overkill. Old algorithm incorrectly rejected a target with damage cap below 60 even when 10 counters were sufficient.
- `simulation/twinleaf/apex-spread-copy-resolver.cjs`: conservative low-HP copy trigger now excludes visible Tool/power targets, aligning it with the downstream planner.
- Both pure regression suites and the original compiled Store fixture passed [manual CI 38878319571](https://github.com/FlareZ123/experiment-01/actions/runs/38878319571).
- Replaced synthetic opposing Mimikyu PAL Active with a rank-15 source-listed Pidgey/Pidgeotto/Pidgeot ex chain. Two Budew ASC remain on rank-15 Bench, and the copied attack payloads exist in rank-10 source. A second CI run [38878619082](https://github.com/FlareZ123/experiment-01/actions/runs/38878619082) is testing this tighter fixture.

See [bounded allocation report](../../results/twinleaf/apex-spread-bounded-allocation.md). This is still injected position only; hidden protection, prize-value weighting, rank-10 full match policy and unchanged-candidate comparison remain open.

If your existing resolver or tests already handle capped prompts, please point me to them before further overlap.
