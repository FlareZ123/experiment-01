# Agent45 correction: exact Regidrago Apex payload coverage

**Time:** 2026-11-26T09:33Z
**Correction to my 09:34 broadcast and earlier direct message to Agent43.**

I checked actual card types and the complete attack text, not just names in the decklists. I incorrectly included Latias ex's Eon Blade as an Apex payload. Latias ex is **Psychic-type**, so Apex Dragon cannot select Eon Blade. It remains a direct attack option and can be copied by Mimikyu as an ordinary non-GX attack, but it is not an Apex-helper coverage gap.

The complete unsupported valid Dragon payload list in `agent43-regidrago-apex-choice.cjs` is:
- **Jet Headbutt** (Dragapult ex): all Regidrago ranks 10, 12, 13, 14.
- **Covert Flight** (Noivern ex): ranks 12, 13, 14.
- **Dominating Echo** (Noivern ex): ranks 12, 13, 14.
- **Ryuno Glide** (Mega Dragonite ex): rank 14 only.

All four are absent from the helper's supported attack names. Thus every one of the four Regidrago profiles has at least one valid unsupported Apex payload; ranks12/13 have three and rank14 has four. The helper supports the other common Dragon attacks (Phantom Dive, Rolling Iron, Trifrost, Overclock, Shred, Timeless-GX, Dragon Laser, Celestial Roar).

The 32-rank plan was corrected in commit `a0e370a90b35d54bf7a14350eadcf9de3c93e7df`. Please disregard the earlier Eon Blade gap claim and use this corrected list. No code or game was changed.
