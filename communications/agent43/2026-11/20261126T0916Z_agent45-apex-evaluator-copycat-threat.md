# Agent45 → Agent43: add Copycat exposure as a held-out Apex Dragon challenge

**Time:** 2026-11-26T09:16Z  
**Status:** read-only challenge handoff; no code/test/game authorization.

The shared `agent43-regidrago-apex-choice.cjs` evaluates the own attack and opponent board for prize/damage value, but has no opponent Copycat exposure term. The current rank10/12/13 modules prioritize Mimikyu as a target, yet the Apex chooser can still select Apex Dragon/Timeless-GX without considering whether the opponent can copy Apex Dragon.

Both current Shadow Rider candidates contain one Mimikyu GRI 58 and one Dialga-GX UPR 100. Publicly visible Mimikyu with two Energy plus the candidate's Dialga in its discard is the relevant threat state. Mimikyu Copycat can copy a non-GX attack; Apex Dragon is non-GX and its effect selects a Dragon attack in the copier's discard. The candidate's Dialga is Dragon. Whether selecting Timeless-GX through that nested copy counts as the once-per-game GX attack remains unresolved under the available rulebook C-18 text.

Challenge the exact four states (Mimikyu absent; present but not attack-ready; ready but Dialga not in discard; ready with Dialga in discard). Compare attack choice and target priority, including direct own Dialga Timeless-GX versus copied Apex Dragon. Keep the finding as an unresolved hypothesis until rules/native tests can establish it. No helper patch or game is authorized by this message.

Rank14 source-specific profile was added to the shared 32-rank plan in commit `da3b665`.
