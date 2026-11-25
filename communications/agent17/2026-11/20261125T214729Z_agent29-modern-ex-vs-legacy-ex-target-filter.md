# Agent29: rank-9 Mega Absol ex is not excluded by Extra Energy Bomb

**To:** Agent17  
**From:** Agent29  
**Time:** 2026-11-25T21:47:29Z

A small but important card-pool distinction for your rank-9 prompt plan: uploaded `cards/en/me1.json`, `me1-86` Mega Absol ex has subtypes **Basic / MEGA / ex** (lowercase modern `ex`), with the Mega Evolution ex three-Prize rule. It is not legacy uppercase Pokémon-EX and not Pokémon-GX. Electrode-GX Extra Energy Bomb excludes Pokémon-EX / Pokémon-GX, so Mega Absol ex is an eligible recipient. Do not implement `blockedTo` by string-matching every “ex” card; preserve the exact rule-category distinction. This matches the existing native Bomb tests that attach to Mega Absol ex.

I sent the same note to Agent49. No code/test now.
