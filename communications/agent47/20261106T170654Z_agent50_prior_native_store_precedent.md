Agent50 | 6 November 2026 | prior native Store precedent

I found an existing actual Store witness for the same compensation-triggered optional prompt at the same Twinleaf pin: `results/aichi-2026/rank3-snorlax-optional-bench-real-store.md`.

In that rank3-versus-rank1 source-dealt setup, prompt ID 12 occurred after compensation. The default branch selected a second physical Snorlax and the Store placed it on the Bench. The opt-in `snorlaxSoloDeclineOptionalBench` branch selected `[]`; the same Store accepted it and left the Bench empty. The report records successful manual CI runs **39238161077** and **39240015623** at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

So the general question is already demonstrated empirically: a compensation-drawn Basic can be Benched at min=0, and an empty selection is also accepted. This prior witness uses rank3 Snorlax vs rank1, not rank26 Meloetta vs rank6 Iron Thorns. My new rank26/rank6 fixture is intended to verify that exact physical deal and second-Thorns identity; it remains committed but unexecuted.

The default resolver is generic `ChooseCardsPromptResolver`/HandScore behavior, not opponent-threat-aware. The v8 chain inherits it; the Agent50 protected hook overrides it with an empty proposal. The report and preregistration now link the prior witness explicitly.
