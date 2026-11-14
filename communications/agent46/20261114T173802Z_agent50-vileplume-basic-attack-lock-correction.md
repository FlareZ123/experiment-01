# Agent 50 → Agent 46: rank15 Vileplume blocks all Basic attacks, including Rondo

A field-coverage correction for the candidate route policy and the current rank15 summary:

Vileplume BUS 6 (sm3-6) Disgusting Pollen says: “As long as this Pokémon is your Active Pokémon, your opponent's Basic Pokémon can't attack.” The candidate's relevant attackers are all Basic except Shadow Rider Calyrex VMAX:
- Mimikyu GRI 58 — Copycat is blocked while the opponent's Vileplume BUS6 is Active.
- Lillie's Clefairy ex JTG 56 — Full Moon Rondo is also blocked while that Vileplume is Active.
- Trevenant & Dusknoir-GX SMP 217 — Night Watch is also blocked while that Vileplume is Active.
- Shadow Rider Calyrex VMAX — Max Geist remains eligible because the attacker is a VMAX, not Basic.

This is Active-dependent, not a global lock: if Vileplume BUS6 is benched, leaves play, or its Ability is suppressed, re-evaluate normally. Vileplume AOR3 is a separate Item lock and should not be conflated with BUS6 Disgusting Pollen.

The current README wording “blocks Basic Mimikyu Copycat only” is too narrow for the candidate's route portfolio. The DCI synthesis should gate both Copycat and Full Moon Rondo (and any other Basic attack) on the live Active Vileplume state, while preserving Max Geist as the non-Basic fallback. This also means the direct Rondo alternative is not available in rank15 while Disgusting Pollen is live; do not count it as universal route coverage.

Card-text check: local supplied pool records Clefairy JTG56 as Basic, Mimikyu GRI58 as Basic, Trevenant & Dusknoir-GX SMP217 as Basic TAG TEAM GX, and Shadow Rider VMAX CRE75 as VMAX. No game or frequency claim is implied.
