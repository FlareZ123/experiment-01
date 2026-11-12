# Sentinel double-lock challenger: known-field counter census and Whismur bridge

**Agent 27 · 12 November 2026 · rules/card-text derivation + exact-name source-list census · untested as a competitive deck**

## Decision

The existing Sentinel Lopunny/Vileplume candidate has a credible structural challenger worth testing: establish **Vileplume AOR 3** as a persistent Item lock and **Stoutland BCR 122** as an Active-only Supporter lock on the same turn. The combination directly addresses the rank-1 Guzma counterreply that pulled an unsupported Vileplume into the Active Spot.

The known 29 original Aichi lists contain a large number of Guzma, Escape Rope, and direct Tool-removal cards, but the printed counter families are unusually separable: no authenticated list combines Garbodor with Tool Jammer, Faba, or Megaton Blower; no list contains Lysandre Labs. This does not establish a game lock. The opponent can still use Stadiums, Abilities, Energy attachments, evolution, and attacks, so attack-based removal of Stoutland/Vileplume remains the main unresolved counter.

## Exact source-field screen

The reproducible script is [`agent27-sentinel-lock-field-census.cjs`](../../simulation/evaluation/agent27-sentinel-lock-field-census.cjs). It reads the unchanged `results/aichi-2026/full-decklists.json`, asserts the current 29-list admission and missing-rank set (23, 25, 28), and counts exact printed card names. It does not infer card access or simulate play.

| Card / package | Authenticated lists | Ranks |
| --- | ---: | --- |
| Garbodor | 4/29 | 8, 11, 16, 22 |
| Tool Jammer | 5/29 | 3, 6, 7, 24, 29 |
| Field Blower | 9/29 | 1, 5, 7, 8, 19, 22, 29, 30, 31 |
| Faba | 7/29 | 2, 3, 6, 7, 10, 24, 29 |
| Megaton Blower | 10/29 | 6, 7, 12, 13, 14, 20, 21, 24, 29, 32 |
| Lost Vacuum | 1/29 | 5 |
| Guzma | 25/29 (48 copies) | 1, 2, 3, 5–16 except 4, 17–22, 24, 27, 29–32 |
| Escape Rope | 7/29 (11 copies) | 4, 5, 9, 11, 17, 26, 31 |
| Lysandre Labs | 0/29 | — |
| Silent Lab | 4/29 | 9, 13, 15, 32 |
| Path to the Peak | 7/29 | 5, 9, 12, 15, 20, 21, 27 |
| Temple of Sinnoh | 5/29 | 3, 8, 11, 16, 22 |
| Power Plant | 0/29 | — |

Important co-occurrence results:

- Garbodor and Tool Jammer: **0** shared lists.
- Garbodor and Faba: **0** shared lists.
- Garbodor and Megaton Blower: **0** shared lists.
- Garbodor and Lysandre Labs: **0** shared lists.
- Garbodor and Field Blower: ranks **8 and 22** only.
- All four Garbodor lists (8, 11, 16, 22) contain Temple of Sinnoh; Temple does not disable Vileplume or Stoutland Abilities. It can suppress Jet Energy's switch effect if it is already in play, so replace it with a Stadium such as Artazon before attaching Jet Energy.

The lock's printed interaction with the known field is favorable:

- Vileplume blocks Item cards from both players, covering Field Blower, Lost Vacuum, Megaton Blower, and Escape Rope.
- Stoutland blocks the opponent's Supporter cards while Active, covering Guzma and Faba.
- Stealthy Hood on both evolved lock Pokémon protects their Abilities from opponent Pokémon Ability effects such as Garbotoxin. In the four Garbodor lists, the known Tool-removal route is Field Blower in ranks 8/22, which is an Item and is unavailable while Vileplume remains active.
- Tool Jammer appears in five lists, but none also has Garbodor. Tool Jammer affects Pokémon Tools on the opponent's Active Pokémon; without an Ability-lock partner it does not turn off the Vileplume/Stoutland Abilities. It may still suppress the Hood attached to the Active Stoutland, but that is not by itself a lock break.
- Silent Lab and Path to the Peak do not disable these non-Rule-Box Stage 2 Abilities. Temple of Sinnoh changes Special Energy effects, not the two lock Abilities.

This is an exact-name presence census over the 29 available 60s, not a response probability. The three missing originals (23 Regidrago, 25 Raichu Electrode Combo, 28 Regidrago) remain outside the screen.

## Whismur bridge into the double lock

A going-second first-turn bridge is available from **Whismur SM7-116**:

- Its one-Colorless `Bawl` attack can be used only when going second and only during that player's first turn.
- The attack prevents the opponent from playing any Trainer cards from hand during their next turn. This includes Items, Supporters, and Stadiums.
- Whismur is a 60 HP Basic, so it is a fragile one-turn bridge, not a durable lock. The opponent can still attach Energy, use Abilities, evolve, and attack. If it is Knocked Out, the Trainer restriction still applies for the turn in which the attack's effect is active.

Proposed going-second sequence:

1. Start with Whismur Active (or use an Energy effect to promote it), attach one Colorless Energy, and use Bawl. If available, establish the search/bench basics and Grand Tree before ending the turn; do not attempt a first-turn Basic evolution with Grand Tree.
2. The opponent's next turn is Trainer-locked, so they cannot use Guzma, Field Blower, Megaton Blower, Escape Rope, or replace a Stadium from hand.
3. On the following turn, use Rare Candy on a Lillipup that was already in play before this turn to evolve directly into Stoutland. Use Grand Tree on a prior-turn Oddish to chain Oddish → Gloom → Vileplume. Both effects are now legal: it is no longer the player's first turn, and the Basics were not put into play this turn.
4. Before Vileplume enters play, attach Stealthy Hood to the Lillipup and Oddish so the Tools persist through evolution. Vileplume's Item lock is symmetrical, so do not leave Rare Candy or Tool attachments until after it appears.
5. Attach Jet Energy from hand to the Benched Stoutland to switch it Active. If Temple of Sinnoh is in play, replace it with Artazon (or another Stadium that preserves Jet Energy's effect) first.

This creates Vileplume Item lock plus Active Stoutland Supporter lock before the opponent's next turn. The existing Sentinel list already contains the relevant Vileplume, Oddish/Gloom, Stoutland/Lillipup/Herdier, Grand Tree, Stealthy Hood, Jet Energy, and Fan Rotom packages; it currently lacks Rare Candy and Whismur. A challenger should test at least one Rare Candy and one Whismur, with a second Stoutland considered for active-lock continuity. A second Rare Candy would remove dependence on Grand Tree for the two lock pieces, but increases the opening requirement. Do not treat a proposed card-count adjustment as a validated 60-card list.

Going first, Whismur's conditional attack is unavailable. The same Rare Candy + Grand Tree (or two Rare Candy) setup can establish the two Stage 2 locks on the player's second turn, before the opponent's next turn, but the opponent has one unrestricted turn to attack or disrupt the Basic setup.

## Critical unresolved risks

1. **Attack-based removal:** Stoutland BCR 122 is only 140 HP and must remain Active. An opponent can attack it; if it is Knocked Out, the Supporter lock ends unless another Stoutland can be promoted immediately. Vileplume AOR 3 is 130 HP on the Bench; it is protected from Trainer-based gust while the double lock holds, but bench-damage attacks can still reach it.
2. **Ability-based disruption:** Hood protects against many opponent Ability effects, but the exact paper interaction must be tested against each relevant Ability. The census does not prove that every Ability lock is blocked by Hood.
3. **Stadiums remain playable:** Vileplume blocks Items and Stoutland blocks Supporters; neither blocks Stadiums. The known Stadium set does not directly disable the two Stage 2 Abilities, but a Stadium can affect Tools or Special Energy and must be included in native opponent policy.
4. **Symmetric Item lock:** Our own Items stop working too. All Rare Candy, Tool attachments, and other necessary Items must be sequenced before Vileplume enters play. Subsequent development must use Pokémon evolution, Supporters, Abilities, Energy, and Stadiums.
5. **Prize and opener consistency:** Rare Candy, Stoutland, Vileplume, Whismur, Oddish, and Lillipup can be Prized or fail to appear. Fan Rotom can search Colorless Basics such as Whismur/Lillipup, but not Oddish. Exact opening probability and a full 60-card challenger remain uncomputed.

## Required next experiment

Build a distinct Sentinel challenger rather than editing the current candidate in place. Test:

- Going-second Whismur Bawl → opponent Trainer-denied turn → Rare Candy + Grand Tree Vileplume/Stoutland.
- Going-first Rare Candy + Grand Tree setup after the opponent's unrestricted first turn.
- Rank 1 Guzma counterreply; ranks 8/11/16/22 Garbodor; ranks 3/6/7/24/29 Tool Jammer; ranks 5/30/31 direct Tool-removal; and the known Stadium set.
- Active Stoutland Knock Out and bench Vileplume damage/snipe responses, including immediate same-turn post-KO Trainer access.
- Whether one or two Stoutland copies are required to maintain the Supporter lock; whether one or two Vileplume copies are required against the actual field's bench-damage attacks.
- Paper legality for the exact final printings and Japanese Extra banned-list version.

**Status:** high-value, rules-derived deckbuilding hypothesis with a favorable 29-list printed counter screen. No native game has been run for this package, no matchup rate is established, and it is not the nominated best deck. It does not demonstrate or imply 99.5%.
