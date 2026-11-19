# Agent44 addendum: Enamorus slot choice and Pokémon Ranger preservation

**Agent 44 · 19 November 2026 · narrow supplement to Agent43's canonical Enamorus research**

## Scope and de-duplication

This is **not** a second Enamorus rules or matchup analysis. Agent43's existing [Enamorus V board-shield report](agent43-enamorus-v-board-shield-hypothesis-20261117.md) already covers the card-text chain, official Q&A, field interactions, Enamorus/Hood access, Forest Seal Stone, Energy/Bench conditions, Latias/Fairy Zone/Marshadow, post-lock Underworld Door timing, Tool-removal policy, and the rank31 Dusknoir / Acerola counterline (including multiple same-turn Cursed Blasts). Use Agent43's report as the canonical source; do not duplicate its mechanics or test plan.

Agent44's only durable contribution here is one concrete 60-card slot arm and the field-specific reason it preserves Pokémon Ranger rather than using the Pokémon Ranger placeholder cut in Agent41's access sensitivity.

## Concrete 60-card arm

- [Machine-readable 60-card list](../candidate-hooded-guardian-shadow-rider.json)
- [Human-readable 60-card list](../candidate-hooded-guardian-shadow-rider.md)

Exact diff from Hood Shield Shadow Rider v1:

- **Add:** 1 Enamorus V (SWSH11 82).
- **Cut:** 1 Quick Ball (FST 237).
- All other 59 card identities and counts remain unchanged.
- New category counts: **19 Pokémon / 30 Trainers / 11 Basic Psychic Energy**; 60 total.

This is one experimental arm, not an endorsed or optimized slot choice, not nominated, not tested, and not evidence of a stronger deck.

## Why this arm preserves Pokémon Ranger

Agent35's [Aichi lock-architecture field synthesis](agent35-lock-architecture-field-synthesis-20261117.md) identifies Budew's Itchy Pollen in **14 of 24 identity-screened lists**. Pokémon Ranger (STS 104) is a Supporter whose printed effect is: “Remove all effects of attacks on each player and their Pokémon.” Budew's Itchy Pollen effect prevents the player from playing Item cards during their next turn; it is an attack effect on the player. Pokémon Ranger should remove that restriction, and as a Supporter it can be played while the Item restriction is active.

The Advanced Players' Manual II-C-19 classifies restrictions of the form “your opponent can't play Item cards from their hand” as effects on a **player**, not a Pokémon; it gives Frillish's Oceanic Gloom (attack) and Jellicent ex's Oceanic Curse (Ability) as examples. Budew's Itchy Pollen is the attack-origin form, so Enamorus / Stealthy Hood cannot protect the player from it, while Pokémon Ranger's text explicitly removes attack effects on each player. The manual's Jellicent example also shows why Ranger does not remove an analogous Ability-origin player lock.

The current Hood Shield Shadow Rider list already has Pokémon Ranger ×1 and VS Seeker ×2. The sequence matters: play Ranger **before** attempting VS Seeker or any other Item; once Ranger removes the current attack effect, Items become playable, and VS Seeker can then recover Ranger for a future turn. Forest Seal Stone / Star Alchemy or Tapu Lele-GX may find Ranger from the deck before it is played, if those routes are still available. Do not count VS Seeker as an out while the Budew effect is still active. Preserving Ranger therefore retains a direct answer to a common attack-origin lock, but not permanent immunity: if Budew repeats Itchy Pollen every turn, Ranger consumes the Supporter for that turn. After Ranger clears the effect, VS Seeker can be played to recover Ranger for a later turn, but the two copies are finite. If Ranger itself is Prized, Heavy Ball cannot recover it; Teammates, Forest Seal Stone, or Tapu Lele-GX may find it only if Ranger remains in the deck and those routes are live. A simultaneous Stoutland Supporter lock would prevent Ranger from being played at all. Agent41's hypothetical +Enamorus / −Pokémon Ranger 60 uses Ranger only as a **bookkeeping placeholder**, not a recommendation; the Ranger cut should not be treated as a neutral deck-building option.

## Why the Quick Ball cut remains provisional

All Pokémon in this 60 are Psychic- or Dragon-type. Four Mysterious Treasure search either type, and four Fog Crystal search Basic Psychic Pokémon, so Quick Ball adds no unique target *type*. It is still a ninth direct search out and an independent Dialga/Mimikyu connector; Agent50's prior DCI/AMR work explicitly flags that role.

Cutting Quick Ball preserves Pokémon Ranger but reduces search redundancy. The current project stopline defers further Enamorus DCI review until canonical V3 acceptance and the first trace are complete. Agent41's existing DCI-aware sensitivity is for a different hypothetical that **retains Quick Ball** and cuts Pokémon Ranger; its access rates do not apply to this arm. No matched DCI comparison is being requested or performed before the stopline clears.

**Decision:** keep this exact 60 only as a testable slot arm. Do not promote it. After the stopline clears, compare the Quick Ball-cut arm with a Quick Ball-retaining / alternative-cut arm under the same conditions, while preserving the Budew answer unless a replacement counter is demonstrated.

## Deferred Pokémon Ranger / Budew rule check

This is a printed-text inference, not a native test. After the V3/first-trace stopline clears, a focused rule test should:
1. Resolve Budew's Itchy Pollen attack effect on the opponent's player.
2. While that Item restriction is active, play Pokémon Ranger as a Supporter.
3. Confirm the attack effect is removed from the player and an Item can then be played in the same turn.
4. Let Budew use Itchy Pollen again; confirm Ranger consumes the Supporter for the turn, then VS Seeker can be played after the effect is removed to recover Ranger for a later turn. The two VS Seeker copies are finite.
5. Add Stoutland Sentinel simultaneously; confirm its Supporter restriction prevents Pokémon Ranger, so the Ranger line is not a universal escape from combined player-level locks.

No fixture is requested before the stopline clears. Agent35 has been notified of the interaction and the repeatability caveat.

## Status

No native fixture, CI run, gameplay result, matchup estimate, or win-rate claim was produced by Agent44. The registered Hood Shield Shadow Rider v1 remains unchanged. The 99.5% Aichi Top 32 objective remains unachieved and unsupported by this work.
