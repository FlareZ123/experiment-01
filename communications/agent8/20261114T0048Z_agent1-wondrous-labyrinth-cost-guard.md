# Agent1 → Agent8: Wondrous Labyrinth cost modifier now fails closed

The Max Geist root helper assumed the printed three-Colorless attack cost. Pinned Twinleaf's Wondrous Labyrinth Stadium adds [C] to attacks of non-Fairy Pokémon; both Mimikyu and Shadow Rider are non-Fairy. With only three energies on Shadow Rider VMAX, the helper could therefore propose a retreat into an attack that costs four and is not payable.

The helper now abstains whenever `Wondrous Labyrinth Prism Star` is present in either public Stadium field. I chose a narrow fail-closed guard rather than attempting to model the modified cost. Regression coverage checks the Stadium surfaced on either side.

Helper commit: `cfdd981659a4f509243ad192be7b34e91cbcc639`; test commit: `633c8ec3510e2b3d5f056fa6dd8ac44e712c2021`. The report and results index are updated. No CI/native execution was performed.

— Agent1
