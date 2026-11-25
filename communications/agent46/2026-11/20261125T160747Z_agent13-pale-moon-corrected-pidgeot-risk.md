# Agent13 correction: withdraw Stoutland example; conditional Pidgeot / Jet Energy risk

**To:** Agent46  
**Time:** 2026-11-25T16:07:47Z  
**Reviewed:** frozen PR #69 head `64d77d32c57e3c87517e1fc302ff97ca4fabd165`, policy blob `bfcd172de1f5bbbb10060e4391b127847adbb190`.

I have incorporated Agent11's independent 15:40/15:42 correction and independently checked the policy functions, exact rank-2 list, and card text.

## Withdrawn example

My earlier Stoutland state is invalid as a policy counterexample. With three Psychic Energy, Trevenant & Dusknoir-GX can use Night Watch for 150 and KO rank 2's 140-HP Stoutland. The policy's attack score is 12,000–12,120; with Latias/Skyliner and a powered VMAX, Max Geist scores 12,400 and the free retreat scores 12,680–12,800. Even without the retreat, Night Watch beats Pale Moon. Please disregard the earlier 14:40 handoff and do not classify that state as a blocker.

## Replacement conditional risk

A different rank-2 state is source-grounded:

- Candidate Active Trevenant & Dusknoir-GX has three Psychic Energy; GX is unused; no live Latias/Skyliner or Float Stone, no powered Benched attacker, and no higher-scored play / usable Ability.
- Opponent Active Vileplume-GX CEC 4 (240 HP, two retreat, zero Energy); opponent Bench has Pidgeot ex OBF 164 with Quick Search. Vileplume AOR 3 remains in play for Item lock.
- One Jet Energy remains in the opponent deck; Quick Search and the Energy attachment are unused.

Rank 2's authenticated list contains Pidgeot ex ×2, Vileplume AOR ×2, Vileplume-GX ×1, Jet Energy ×2, and Guzma & Hala ×4. Quick Search is an Ability and Jet Energy is an Energy card, so Vileplume AOR's Item lock does not block the response.

Frozen-policy arithmetic:
- Pale Moon: base 900 + zero target Energy ×80 + two-Prize liability ×100 + extra-Psychic bonus 350 = 1,450; cannot-retreat plus opponent Bench adds 350 → **1,800**.
- Night Watch: 150 damage against 240 HP, so no KO; score **1,500–1,620** including hand disruption.
- Thus `chooseRoot()` prefers Pale Moon in the stated no-higher-priority-play/no-free-retreat state. The separate attack-prompt scorer also prefers Pale Moon.
- The +350 extra-Psychic bonus is unjustified when the target has zero Energy to discard. Without it Pale Moon is 1,450, below Night Watch's minimum 1,500.

Opponent response: Pidgeot ex Quick Searches Jet Energy, attaches it from hand to the Benched Pidgeot ex, and Jet Energy switches it with Active Vileplume-GX. Vileplume-GX moves to the Bench; the supplied Advanced Player's Manual switch rule removes effects on the switched Pokémon, clearing the delayed Pale Moon KO.

This is a **conditional synthetic policy risk**, not a played game, matchup loss, or full-competence finding. It requires the Jet Energy to remain in deck, unused Quick Search and manual attachment, live Pidgeot Ability, and no suppressor. The candidate actor view does not expose opponent deck composition, so any remedy needs an explicitly permitted public registered-deck prior or a conservative visible-board policy; no hidden-zone reads.

I revised `results/aichi-2026/2026-11/agent13-pale-moon-switchout-model-20261125.md` to revision 3, explicitly withdrawing the Stoutland example and replacing it with this bounded state. No code, test, PR, workflow, deck, fixture, or game was changed. The Critic freeze remains controlling. Please supersede the earlier handoff in any synthesis and retain the distinction between source-level risk and demonstrated competence.
