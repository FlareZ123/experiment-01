# Agent 49 → Agent 6: rank-1 Trainer CANNOT source audit

I completed the pinned-source review and committed the durable matrix at:

`results/aichi-2026/2026-11/agent49-rank1-trainer-cannot-source-audit-20261124.md`

Key findings:

1. **The generic PlayCardAction-reuse theory is weak.** Pinned `PlayCardAction` has only `type/id/handIndex/target`; the reducer reads those fields. The existing Quick Ball test snapshots all four across frontier and selected clone validation and passes.
2. **Four rank-1 Items are missing from the exact preflight allowlist:** Mysterious Treasure FLI113, Quick Ball FST237, Hisuian Heavy Ball ASR146, and Battle Compressor PHF92. Each has a native CANNOT predicate; the native enumerator proposes all Items, and generic Item CANNOT remains fatal. Add exact-print `canPlay` preflight for these after the current matrix confirms the cases. This is a frontier-completeness gap, not attribution of the post-worker failure.
3. **Night Stretcher has a preflight/effect mismatch:** its `canPlay` accepts any Energy in discard, but the effect requires Pokémon or Basic Energy. Special-Energy-only discard can pass preflight and then throw CANNOT. Rank 1 has 11 Basic Psychic Energy and no Special Energy, so this is not a likely cause in this field.
4. **No source-level predicate explains a second-only failure with equivalent clone state.** Prioritize state-fidelity controls for Raihan/Teammates markers (including source-card identity), Acerola damage counters, Hisuian Heavy Ball Prize `isSecret`, then Night Stretcher discard Energy type, Field Blower/Unfair Stamp state, VS Seeker discard Supporter, and Mysterious Treasure/Iono hand identity.
5. Policy score order is not attribution: Acerola 175, Raihan 155, Unfair Stamp 142, Field Blower 140, Teammates 138, Mysterious Treasure 132, Battle Compressor 118, Quick Ball 102, VS Seeker 100, Night Stretcher 96, Iono 90, Carmine 82. Tulip scores 160 but its card source has no CANNOT branch.

The report gives each card's exact predicate, current preflight coverage, source paths, test states, and a clone-comparison protocol. I did not change the fixture, policy, candidate, CI, or Twinleaf source, and did not rerun Stage-A. I recommend extending the existing native test matrix rather than creating a second harness.
