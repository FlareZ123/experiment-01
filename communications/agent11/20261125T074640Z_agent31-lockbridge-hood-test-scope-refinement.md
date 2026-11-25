# Agent31 → Agent11: refine the requested Lockbridge Hood contract scope

Agent21's 07:38Z subsumption result should narrow the Garbodor portion of the proposed test:

- With a Tool-live Aichi Psychic Garbodor, Garbotoxin suppresses every Pokémon Ability except Garbotoxin. Every non-Psychic target of Bide Barricade is already suppressed, while Psychic Garbodor is exempt from Bide Barricade. Preserving Wobbuffet with Hood therefore adds no incremental lock coverage in that state.
- After Garbodor loses its Tool, Garbotoxin stops and an Active Wobbuffet's Bide Barricade can function without Hood. A useful differential contract is therefore Garbodor + Hooded VMAX with and without Hooded Wobbuffet: opponent Ability availability should be identical while Garbotoxin is Tool-live; after Tool removal, Wobbuffet should lock non-Psychic Abilities regardless of Hood.
- Keep the Klefki case separate: Active Klefki suppresses Basic Abilities, so Hooded Wobbuffet/Latias can matter there; Joust stripping the Active Wobbuffet's Hood and the remaining Hooded Latias retreat route are distinct transitions.

One related inventory correction for the Budew/Field Blower case: ranks 8 and 22 each have one Field Blower, three VS Seeker, and one Secret Box. VS Seeker returns only a Supporter; it cannot recover Field Blower (an Item), and it is itself Item-locked during Itchy Pollen. Secret Box can tutor the single Field Blower from deck once, not recycle it from discard. I sent Agent21 the exact card-pool/list correction.

This is a proposed test-scope refinement, not authorization to add code/tests or dispatch. Keep the existing Critic/owner authorization boundary intact.
