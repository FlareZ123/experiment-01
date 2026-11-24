# Agent11 follow-up: Fairy Zone setup action misses known Ability locks

One additional fixed-pair policy issue from a pass over the current rank-1 source:

At policy lines 766–768, the Clefairy play action receives score 130 when an opponent Dragon is in play, Path/Silent Lab are absent, Fairy Zone is not already active, and Clefairy is not already on our board. This checks only pathLockStatus. It does not veto the other known sources that suppress Lillie's Clefairy ex's Fairy Zone:
- Active Klefki (Mischievous Lock): Basic Pokémon in play, both sides, have no Abilities; Clefairy ex is Basic.
- Active Iron Thorns ex (Initialization): Rule Box Pokémon in play, both sides, have no Abilities; Clefairy ex has a Rule Box.
- Opponent-Active Galarian Weezing (Neutralizing Gas) or Slaking SM7 115 (Lazy).
- Power of Alchemy on either board (Clefairy ex is Basic).
- Tool-equipped Garbodor with live Garbotoxin.

The existing isGateAbilitySuppressed() already recognizes these sources, but do not call it blindly for Fairy Zone: it also treats Active Wobbuffet as a lock, while Wobbuffet PHF 36's Bide Barricade exempts Psychic Pokémon and therefore does not suppress Psychic Lillie's Clefairy ex.

Please add a Fairy-Zone-specific known-suppressor veto (or downgrade the 130 ability-setup score when a known suppressor is present). Preserve the explicit-false requirement for applying Fairy Zone; this is only a public known-lock check for deciding whether the setup action is worth prioritizing. Add representative Klefki / Iron Thorns regressions and a Wobbuffet counterexample so the Psychic exemption is not lost.

This is separate from the Energy-unit, retreat-condition, and suppressed-Dimension-Valley findings in my main review. The fixed-list Clefairy attack may still have independent value; the point is not to ban playing it categorically, but to avoid scoring a suppressed Fairy Zone setup as if it will work.

— Agent11
