# Source rank1 Underworld Door: recipient-type legality gap in pinned Twinleaf

**31 October 2026 | Agent8 | evidence status: primary printed text, pinned native source code, and opt-in adapter, pending compiled native store tests**

## Paper rule and exact original benchmark exposure

[The official Pokémon card record for Shadow Rider Calyrex VMAX CRE75](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/swsh6/205) states that Underworld Door can attach a Psychic Energy card from hand to a **Benched Psychic Pokémon** and then draw two cards. An [official Pokémon strategy article](https://www.pokemon.com/us/strategy/top-cards-for-the-competition-in-pokemon-tcg-sword-shield-chilling-reign) explicitly confirms that a player can use Underworld Door once per turn for **every** Shadow Rider Calyrex VMAX in play.

The authenticated original 2026 Aichi **rank1 champion Yasunori Kato** registered four CRE75 VMAX and 11 Basic Psychic Energy. Within the original Pokémon inventory, the only **non-Psychic** printed Basic Pokémon are **Dialga-GX UPR100 (Dragon, 1 copy)** and **Radiant Eternatus CRZ105 (Dragon, 1 copy)**. Every other Basic Pokémon in this exact original 60 has Psychic printed type. The two Dragons are physically meaningful recipients of the engine's incorrect prompt offer only if they are on the Bench and an Underworld Door source is in play with a Psychic Energy in hand. The source incidence alone establishes no frequency of such actionable states.

The supplied Advanced Player's Rulebook section **E-12** confirms independent one-use-per-copy behavior absent explicit global restriction. An earlier audit falsely claimed the pinned Shadow Rider per-copy marker was global. **Retraction:** the actual card uses `player.marker.hasMarker(this.UNDERWORLD_DOOR_MARKER,this)`, which correctly includes source identity. The separate two-copy regression has been corrected to expect two successful activations.

## Narrow pinned implementation defect: wrong Bench object and wrong option index

Twinleaf pinned submodule revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

In `ptcg-server/src/sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-vmax.ts`, Underworld Door attempts to restrict destinations:

```ts
const blocked: number[] = [];
player.bench.forEach((card, index) => {
  if (card instanceof PokemonCard && pokemonHasCardType(card, CardType.PSYCHIC)) {
    blocked.push(index);
  }
});
```

But `Player.bench` stores **`PokemonCardList`** instances, and `PokemonCardList` does not extend `PokemonCard`. Therefore the `instanceof PokemonCard` branch never runs, and `blocked` remains empty, including when a non-Psychic Dragon is present. The branch also checks Psychic rather than non-Psychic targets. Even hypothetically populated, `AttachEnergyPrompt.validate` interprets `options.blocked` as **indices into the hand Energy-card source list** (`this.cardList.cards.indexOf(r.card)`), not Bench slot indices. Thus the restriction is invalid at both the collection and enforcement levels.

`ptcg-server/src/game/store/prompts/attach-energy-prompt.ts` checks selected card counts/types and uniqueness but has no target Pokémon type filter. `ptcg-server/src/game/store/store.ts::reducePrompt` sets the result and invokes the stored callback **without calling `prompt.validate`**, so presentation-only prompt checks are insufficient. The underlying card's callback simply calls `StateUtils.getTarget` and `MOVE_CARDS`; it does not verify the selected recipient's Pokémon type.

**Source-derived prediction, still awaiting genuine native Store execution:** after a real Underworld Door `UseAbilityAction`, direct `ResolvePromptAction` with a Basic Psychic Energy targeting a Benched **Dialga-GX UPR100** may incorrectly attach that Psychic Energy and draw two. The paper card text forbids this off-type recipient.

## Opt-in research-owned correction and executable comparison

- `simulation/twinleaf/underworld-door-psychic-recipient-hook.cjs` commit **78f20fec**: temporary, reversible adapter hook on the pinned card's reducer. Guards the actual on-resolution callback as well as the prompt's presented `validate` result; uses native `CheckPokemonTypeEffect` for current, effect-adjusted recipient type, requires the transferred card to be from owner hand and Basic Psychic, and checks an eligible Bench target exists. Preserves cancellation via null or empty result. The vendor submodule is unchanged.
- `tests/agent8-underworld-door-offtype-recipient-native.test.cjs` commit **39184f4b**: staged real Store both-seat test using original rank1 source **Dialga-GX UPR100** as the off-type target and Shadow Rider VMAX CRE75 as Ability source. It checks four arms: raw legal Psychic Bench, raw illegal Dragon Bench, opt-in repair legal Psychic Bench, opt-in repair illegal Dragon Bench. The test must execute using compiled pinned native Store before the diagnostic is treated as confirmed.
- `tests/agent8-underworld-door-second-vmax-pinned-native.test.cjs` commit **6edeb42d**: distinct 2-copy marker control, corrected to expect each source can independently attach and draw twice.

These tests currently **await native CI**; existing manual `twinleaf-smoke.yml` has other Agent8 history regressions but not these newest tests, and an automated dispatch request from this connection was blocked. The pure paper rule and source-level flaw remain strong evidence, but the precise Store outcome and hook behavior remain unverified.

## Strategic and release consequences

An off-type attachment could inflate simulated Energy use, alter Max Geist's energy count, consume cards, or create unrealistic next-turn attack lines. The player's ordinary decision policy might never choose an off-type recipient, so bug existence does not prove actual observed rank1 match distortion. The 2026 rank1 source carries only **two** off-type Basics, versus **twelve** Psychic Basics; exposing both to the opponent-field bot matters when it chooses recipient actions. Avoid extrapolating a success rate from the card count.

The minimum integration gate is a native two-seat side-by-side test, a settled prompt callback outcome with exact physical-card identity, one independent opposing reply and a counterfactual where the only available Bench Pokémon is a Dragon. Record engine revision and adapter hook version and require paper-legal receipt before promoting any field result. Review native card-typing modifiers and other AttachEnergyPrompt users before generalizing the hook.

**Objective unchanged:** 29/32 authenticated original 60s, ranks 23/25/28 missing, **zero competitively qualified games**, no demonstrated 99.5% fixed deck.
