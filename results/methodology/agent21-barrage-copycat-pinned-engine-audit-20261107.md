# Ω Barrage and Mimikyu Copycat history in pinned Twinleaf

**Author:** Agent21  
**Date:** 7 November 2026  
**Pinned engine:** `vendor/twinleafgg` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** source audit and research-owned exact-pair adapter committed; actor integration and manual CI pending

## Question

Does the pinned Twinleaf revision expose a reliable way to distinguish an Ω Barrage second-attack prompt from ordinary attack-copy prompts, and what history should be exposed to Mimikyu Copycat?

## Pinned-source findings

### 1. Barrage is represented by an explicit card-power marker

The pinned Bunnelby PRC definition in:

`ptcg-server/src/sets/07-x-and-y/set-primal-clash/bunnelby.ts`

declares a power with:
- `name: 'Barrage'`;
- `powerType: PowerType.ANCIENT_TRAIT`;
- `barrage: true`;
- text stating that the Pokémon may attack twice in a turn.

The card's own `reduceEffect` handles Burrow and Rototiller. The generic extra-attack handling is in the game effect reducer.

### 2. The generic Barrage path has a clear sequence

In the pinned:

`ptcg-server/src/game/store/effect-reducers/game-effect.ts`

the attack resolver reads the active Pokémon card and calculates:

```ts
hasBarragePower = attackingPokemonCard.powers.some(
  power => power.barrage
);
```

After the first attack resolves, when either the attack or an active power has Barrage and the nested effect has not already used Barrage, the engine:
1. resolves state checks;
2. asks the player with `ConfirmPrompt(..., GameMessage.WANT_TO_USE_ABILITY)`;
3. if accepted and the active card has a Barrage power, creates a `ChooseAttackPrompt` using `GameMessage.CHOOSE_ATTACK_TO_COPY`;
4. supplies the same active Pokémon card (and potentially its first Tool) in the prompt's attackable-card list;
5. resolves the selected second attack with `_barrageUsed = true`, preventing a third Barrage recursion.

The actual Bunnelby confirmation message is `WANT_TO_USE_ABILITY`. The separate `WANT_TO_USE_BARRAGE` enum is not used in this pinned execution path.

### 3. CHOOSE_ATTACK_TO_COPY is generic, not a Barrage-specific marker

The pinned:

`ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts`

uses `GameMessage.CHOOSE_ATTACK_TO_COPY` in the generic copy-attack helper. Other copy-attack cards also call this helper, including cards that choose attacks from an opponent's Active Pokémon, a Bench Pokémon, or a supplied Pokémon list.

Therefore, the prompt message alone cannot identify an Ω Barrage follow-up. The combination of:
- active source card included in the prompt's card list; and
- `sourceCard.powers.some(power => power.barrage === true)`

is a much stronger marker. A robust tracker should also pair the follow-up with the immediately preceding declared attack from the same player, source Pokémon, and turn.

## Implications for the research-owned history adapter

The tracker now identifies the follow-up only when all of the following hold:
- the prompt is `ChooseAttackPrompt` with `CHOOSE_ATTACK_TO_COPY`;
- the active source card is present in the prompt's offered cards;
- the active source card has `powers.some(power => power.barrage === true)`;
- the immediately preceding recorded attack belongs to the same player, source card, and turn.

It tags the preceding attack and follow-up with an internal pair ID and ordered first/second roles. `getCopycatChoices(playerId)` returns the verified pair, filtering GX attacks and the opponent's own Mimikyu Copycat attack individually. Other copied-attack effects remain eligible when they are non-GX. When no pair exists, it returns only the opponent's actual last attack if eligible; it does not fall back to an earlier attack when the actual last attack is GX or Mimikyu's Copycat. Full ordered history remains available separately for diagnostics.

The detached public receipt maps internal pair IDs to a sanitized `barragePairIndex` and role, validates exactly two ordered rows from the same source printing and turn, and does not expose the internal identifier. The native Bunnelby fixture now asserts the exact pair and uses the selected pair member for Copycat. A separate fake-Store test checks that a generic non-Barrage `CHOOSE_ATTACK_TO_COPY` prompt does not create a pair, and that uncopyable last attacks do not fall back.

The manual workflow `.github/workflows/mimikyu-copycat-regression.yml` now runs the native fixture, pair-set tests, and public-receipt tests. This manual workflow has **not** yet been dispatched. The local fake-Store state-machine reproduction passed, but the pinned-engine integration tests remain pending CI.

## Existing native fixture

`simulation/twinleaf/agent8-mimikyu-burrow-native.cjs` exercises the actual pinned Store sequence for Bunnelby:
- first AttackAction;
- ConfirmPrompt with `WANT_TO_USE_ABILITY`;
- ChooseAttackPrompt with `CHOOSE_ATTACK_TO_COPY` and Bunnelby among the offered cards;
- second attack;
- opponent turn transition.

The fixture verifies both source attack orders and shows that the pinned Store's `playerLastAttack` retains the original AttackAction attack, while the research-owned tracker retains both attack records. This validates the adapter's observation path for the Bunnelby fixture; it does not yet show that the common actor policy consumes the exact pair.

## Limitations

- This is a source audit of one pinned engine revision, not an upstream compatibility claim.
- The official paper ruling still governs the permitted Copycat choice; Twinleaf implementation is evidence about the prompt sequence, not authority for paper legality.
- The actor-observation integration remains pending; the tracker and detached receipt now expose the exact-pair fields for that consumer.
- No full-game or competitive win-rate result follows.

## Relevant repository artifacts

- Tracker: `simulation/twinleaf/copycat-multiattack-history.cjs`
- Public receipt: `simulation/twinleaf/agent8-public-event-receipt.cjs`
- Native fixture: `simulation/twinleaf/agent8-mimikyu-burrow-native.cjs`
- Test: `tests/agent8-mimikyu-burrow-native.test.cjs`
- Manual workflow: `.github/workflows/mimikyu-copycat-regression.yml`
- Previous-turn availability result: `results/methodology/agent21-copycat-history-availability-20261107.md`

## 7 November correction: copied-attack metadata is not Mimikyu Copycat eligibility

A review of the official Pokémon Card Game FAQ found that the previous implementation's blanket `copycatAttack === true` exclusion was too broad. The official FAQ page [here](https://www.pokemon-card.com/rules/faq/search.php?page=621&regulation=all&sc_group_id=728%2F1000) establishes three distinct cases:

- Mimikyu may copy Zoroark BREAK's Foul Play, even though Foul Play itself selects and uses another Pokémon's attack.
- After an Ω Barrage Pokémon uses two different attacks during one turn, Mimikyu's owner may choose either attack.
- Mimikyu may not copy an attack that was itself used through an opponent Mimikyu's Copycat.

Therefore the paper eligibility predicate is now **non-GX and not an opponent Mimikyu's own Copycat attack**. Twinleaf's generic `copycatAttack` metadata cannot substitute for this rule: Regidrago VSTAR's Apex Dragon is non-GX and must remain eligible despite that metadata flag. The correction is research-owned and does not modify the pinned submodule.

Committed changes:
- Tracker correction `c58453208aa3970f4800e1313eef709a200b9f4c`, documentation follow-up `db1dafc6b7fd2966cc72b14c7dc1f581968fac6a`, and strict non-GX check `bbd2c6be1753f3dad5e3f0ae91722c50221ec007`; source-card name is retained on each attack record and the exported predicates are `isMimikyuCopycatAttack` / `isMimikyuCopycatEligibleAttack`.
- Test expansion `4426897c6ae8b0ded5ac81b5ea7bfec263e0fb43` and assertion repair `ceb8338da139c0657336cbb072917b1b662bb7a9`: Apex Dragon remains eligible despite its `copycatAttack` metadata; Zoroark BREAK's Foul Play remains eligible under the official ruling; GX and Mimikyu's own Copycat are rejected; temporary history dispatch restores the original record.
- Receipt marker `mimikyuCopycatCompatible` added by `0d92ddd8d4abacde6d71af81263bab944913119b` with tri-state semantics: `null` when the previous-turn snapshot or tracker choice API is unavailable; otherwise `true` only when the actor's Active Pokémon has a printed Copycat attack and the tracker-certified choice set is non-empty; `false` when history is known but either condition is absent. This is a history-compatibility marker only, not a full attack-legality or native-settlement claim. Tests are in `tests/agent7-copycat-history-root.test.cjs` (commit `b345a69f389e7c8570fee906f435915a3c7e90f8`).

The existing manual `.github/workflows/mimikyu-copycat-regression.yml` already includes the tracker and receipt test suites. It has not yet been dispatched against these corrections. Native CI validation remains pending; no full game, matchup, deck-strength, or win-rate conclusion follows.
