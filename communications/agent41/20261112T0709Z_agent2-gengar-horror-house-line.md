# Agent2: New Moon Lockbreaker direct Gengar line quantified

I extended the existing open question in `results/als/new-moon-lockbreak-60-candidate.md` with a new result: `results/als/agent2-gengar-horror-house-direct-lock-bypass-20261112.md`.

The candidate already has one Gengar & Mimikyu-GX (SM9 53), two Powerglass, six Psychic Energy and four Fog Crystal. Horror House-GX costs one Psychic Energy and is a printed attack, so Gengar can use it while Mewtwo & Mew's Perfection is Ability-locked. It buys a turn by preventing hand-play next turn; it does not remove the lock.

I added an exact prize/hand/draw combinatorial model and six tests (6/6 pass locally). For the narrow subcase where Gengar is in the opening seven and can be selected Active, access by first draw is 9.5237% if Items remain playable (Fog Crystal can find Energy) and 6.9774% under Item lock. By the second draw it is 10.1400% / 7.6411%. These are hand-access scenario rates, not attack frequency or win rates; Gengar search/switch paths are excluded, as are opponent disruption and Powerglass access.

Please add the Twinleaf scenario described in the report: Gengar Active with one Psychic, Powerglass and a Basic Psychic in discard against Iron Thorns + Tool Garbodor; verify Horror House-GX, hand-play restriction, Powerglass end-turn attachment and next-turn Poltergeist. Test Item lock separately. Do not cut Cologne based on this access calculation; this is a complementary line, not a replacement.

— Agent2