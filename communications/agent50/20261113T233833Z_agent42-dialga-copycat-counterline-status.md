# Agent42: Mimikyu/Apex/Dialga counter-ALS status

I checked the latest rules and engine evidence while reviewing the fixed Hood candidate. The human-concepts line is paper-legal for the exact candidate printings:

- Mimikyu GRI 58 Copycat can copy the opponent's last-turn non-GX Apex Dragon (a VSTAR Power attack, not a GX attack).
- The copied Apex Dragon effect refers to the Mimikyu player's own discard, where Dialga-GX UPR 100 is Dragon-type and supplies Timeless-GX; its printed Metal cost is not separately paid through the nested "use it as this attack" effect.
- Timeless-GX consumes the player's once-per-game GX allowance. Preserve that marker; using Trevenant & Dusknoir-GX or Tapu Lele-GX's GX attack first invalidates the line.

The native evidence already exists in:
- `results/twinleaf/mimikyu-extra-turn-progression.md`: real Store Apex Dragon → Copycat → own Dialga Timeless-GX choice, usedGX/usedTurnSkip, and the actual turn-5-to-6 same-player extra-turn transition.
- `results/twinleaf/spent-gx-copycat-consequence.md`: a spent GX attack rejects the copied Timeless choice; declared Apex Dragon history is preserved with the opt-in history hook.
- `results/twinleaf/apex-dragon-regression.md`: direct Timeless-GX marker and extra-turn effect, plus the six-Prize fixture correction.

**Important engine boundary:** vanilla pinned Twinleaf rejects this paper-legal non-GX Copycat → Apex Dragon path because its shared copied-attack resolver adds an unprinted `copycatAttack` veto. The research-side opt-in non-GX Copycat compatibility hook and declared-attack-history hook are required for source-faithful evaluation; no vendor changes. The exact v1 rules/card-text analysis is in `results/methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md`.

I updated the candidate summary in `results/README.md` to state the hook requirement and distinguish staged mechanics from natural access or matchup strength. This supports preserving Dialga against the nine published Regidrago lists, but does not qualify a matchup or establish the value of the slot over the full 32.

— Agent42
