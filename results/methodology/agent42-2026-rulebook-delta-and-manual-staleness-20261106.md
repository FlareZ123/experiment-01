# Agent42: 2026 Pokémon TCG rulebook delta and local manual staleness

**Date:** 6 November 2026  
**Aichi Open League event date:** 10 May 2026

## Finding

The repository's only structured advanced manual is `resources/manual/EN_advanced_manual-2025-transcription-structured.md`. The Aichi Top 32 event metadata in `results/aichi-2026/full-decklists.json` gives **2026-05-10**. Pokémon's official Professor Program published a 2026 Rule Book update overview on 26 February 2026, effective 20 February 2026. The event therefore occurred after the 2026 rules update.

The 2025 manual remains useful for the extensive rules it covers, but it is not a complete paper-rules authority for the May 2026 event. A short, versioned 2026 delta supplement should accompany it in paper-legality reviews.

## Officially described 2026 changes relevant to simulation

The official Professor Program update overview identifies several changes/clarifications, including:

- **“Up to” on attacks:** attacks that say “up to” may now choose zero; Trainer cards and Abilities retain the at-least-one restriction.
- **Simultaneous effects:** the active player chooses the order for simultaneous effects during their turn; the next player chooses during Pokémon Checkup.
- **Ghetsis / empty shuffle:** if an effect would shuffle cards into a deck but no cards meet the condition and zero cards are shuffled, the deck is not shuffled.
- **Effect sequencing:** the initial effect must finish before handling triggered effects.
- **Sudden Death:** the rulebook's casual Sudden Death procedure was removed; sanctioned tournament tiebreaker procedures remain a separate tournament-rule question.

These are rule-source facts from the 2026 update overview, not findings that the pinned Twinleaf revision implements them correctly.

## Repository and field audit

- Local manual: 2025 structured transcription.
- Event: 2026-05-10, after the effective date.
- The authenticated 29 Top 32 lists contain no exact-name occurrences of `Mega Lucario ex`, `Ghetsis`, `Welder`, or `Eevee` in the current English inventory. That narrows immediate field-specific exposure for those examples; it does not remove the need to model the 2026 rules for the full Expanded pool or candidate lists.
- The pinned Twinleaf revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, committed 15 October 2026, after the rule update. Its date alone does not prove support; each affected interaction still needs source inspection and native regression tests.
- The Tapu Cure-GX investigation above illustrates why the 2025 manual's Trainer/Ability wording should not be generalized to attacks without checking the 2026 rule source and exact card text.

## Recommended use

1. Keep the 2025 structured manual as the detailed local reference.
2. Add a compact 2026 rule-delta supplement, with provenance to the official Professor Program update overview.
3. For each candidate/Top32 card interaction affected by a delta, record the rule version, exact card text, pinned Twinleaf implementation, and a native regression test.
4. Keep paper-rule adjudication separate from engine behavior; do not infer correctness from a successful native simulation.
5. Do not claim the 2025 manual alone establishes full paper legality for the 10 May 2026 event.

No deck-strength or matchup conclusion is made here.


## Provenance

Primary external update reference: [Pokémon Professor Community, “February 2026 Rule Book Updates - What you need to know!”](https://professorprogram.pokemon.com/news/11473085), page published 26 February 2026. The article states the changes took effect on 20 February 2026 and summarizes the “up to” attack change, tournament/casual Sudden Death distinction, simultaneous-effect ordering, empty Ghetsis shuffle, and Welder/trigger sequencing. The 10 May Aichi event postdates the stated effective date.
