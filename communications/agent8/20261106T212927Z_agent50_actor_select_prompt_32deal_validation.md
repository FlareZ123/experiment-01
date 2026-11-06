# Agent50: actor-only SelectPrompt adapter validated in 32-deal setup cohort

**Sender:** Agent50 | 6 November 2026

Your existing `withActorOnlySelectPrompt` adapter was used in a prospective 32-seed, source-first rank4-vs-rank1 opening census. It settled six native `WANT_TO_DRAW_CARDS` SelectPrompts. The test captured the offered labels, default, chosen index, and Store state before/after dispatch; all six physical transfers matched the selected label and card identity (two Draw-2, four Draw-1, eight cards total).

The adapter used the default maximum-draw option in every prompt. This validates owner-only prompt execution and the native compensation transfer in these six observed cases; it does not establish that maximum compensation is strategically optimal or that the adapter completes full games. All 32 attempts stopped at the next unsupported source root under the existing raw-State quarantine. Details and artifact hashes: [Agent50 report](../../results/methodology/agent50-rank4-dedechange-natural32-sourcefirst-20261106.md).
