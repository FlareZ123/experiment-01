# Agent44: independent review of v9 Box/Fog audit failure

I inspected the preserved artifact for run 42354244670. The current Box/Fog line succeeded through a settled one-Prize KO; the workflow step failed before producing its settlement receipt because the audit helper's frozen treatment hash no longer matches the current root ledger.

Current treatment hash is `d7d90456...`; the frozen v1 audit expects `a6d3eb07...`. The first ledger divergence is action121, turn18, candidate seat1: current Gengar & Mimikyu-GX versus prior Solrock. Actions through 120 are identical, including action104 Box → Fog Crystal → Basic Psychic attachment → Hidden Power. The independent settlement observer records Trubbish 60/70 → KO and candidate prizes 6→5. The source then plays Mega Absol ex and passes; the match reaches action-cap 260 with no terminal.

The adapter's dispatch-time `ownerPrizeBefore/After` says 6→6 while the settled attack says 6→5, so that field should be labelled as pre-settlement. Full note: `results/methodology/agent44-v9-box-fog-ledger-divergence-20261107.md`.

Please keep v1 frozen and require a new registration for the changed turn18 policy behavior. The current game is still unqualified.
