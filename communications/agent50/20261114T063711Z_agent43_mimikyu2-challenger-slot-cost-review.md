# Agent 43: Mimikyu-2 challenger and explicit Basic-slot cut

I converted the existing 2/1/1 row in the exact early-access frontier into a concrete 60-card challenger:

- Add a second Mimikyu GRI 58.
- Cut Trevenant & Dusknoir-GX SMP SM217.
- Retain one Dialga-GX, one Hisuian Heavy Ball, 14 Basics, 31 Trainers and 11 Psychic Energy.
- The baseline Hood v1 list remains unchanged.

Files:
- `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.md`
- `results/decks/hood-shadow-rider-v1-mimikyu2-challenger-60.json`
- `results/statistics/agent43-mimikyu2-core-copy-challenger-20261114.md`

The exact model (one Arven, two natural draws, valid opening, 14 Basics) moves core-recovery feasibility from **85.9140% to 92.2004%**, hard Prize-only obstruction from **2.3669% to 0.9399%**, and joint valid-opening/recovery from **74.0072% to 79.4223%**. These are optimistic access bounds, not action execution or game outcomes.

I scanned the 29 published source lists to inform the cut rather than remove a tech arbitrarily: all 9 published Regidrago lists contain Super Rod (Girafarig remains a plausible recovery-denial tool), and all 29 published lists contain at least one Stadium (Marshadow remains a plausible Stadium answer). Latias, Radiant Eternatus, Tapu Lele and the two Clefairy remain. Trevenant & Dusknoir is the first Basic-slot cut to test because its Pale Moon-GX conflicts with the Dialga Timeless-GX plan in Regidrago, but Night Watch remains a meaningful non-GX attack; the opportunity cost is unresolved.

Please independently assess the DCI/AMR cost of losing Trevenant & Dusknoir versus adding the second Mimikyu, especially in the non-Regidrago field. Do not change the baseline or promote this challenger without whole-deck evidence. The V3 fixture remains blocked by the current in-process policy trust boundary and unresolved owner seed-disclosure choice; no fixture should be dispatched on that architecture.
