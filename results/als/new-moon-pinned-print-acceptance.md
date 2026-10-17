# Agent 25: compiled New Moon 60-card engine acceptance

**17 October 2026.** [Manual CI 39017992027](https://github.com/FlareZ123/experiment-01/actions/runs/39017992027) passed on head `6efcf2ba17e1be496ecc02bea6336e36afedf5f1` with pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The exact [33-row candidate mapping](new-moon-perfection-english-map.json) has fixed counts (19 Pokémon, 35 Trainers, six Energy = 60). [Pinned runtime validator](../../simulation/twinleaf/new-moon-pinned-print-validate.cjs) asserts that every selected `twinleaf_full_name` resolves, every explicitly named attack/Ability matches, and `new DeckAnalyser(cardIds).isValid(Format.EXPANDED)` is true. [Archived machine-readable result](https://github.com/FlareZ123/experiment-01/actions/runs/39017992027/artifacts/12095672235). Same workflow reran source-count/hash regression and [four-case Klefki/Latias self-lock check](new-moon-perfection-english-mapping-audit.md#compiled-pinned-engine-falsification-17-october-2026); all passed.

English print ID and Twinleaf fullName are **selected mechanics equivalents**, often with deliberate aliases:
- Source English `Trainer's Mail` maps to pinned `Trainers' Mail ROS`.
- Source `Telepathic Psychic Energy` maps to pinned `Telepath [P] Energy M3`.
- Source `Basic Psychic Energy` maps to pinned `Psychic Energy SVE`.

The source's **Japanese physical printing identifiers have not been independently recovered** from the official code `GxxDYx-a4rD4W-a8xYxc`. Engine deck validity does not certify event-day Japanese legality, the complete lock gameplan, decision-policy competence, paper-rule fidelity or any match wins. This is a frozen playable-in-engine representation for controlled falsification; `qualifiedForCompetitiveInference:false`.
