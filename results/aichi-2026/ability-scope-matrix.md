# Champion candidate: Ability-lock scope matrix

**Question:** Which named 2026 Aichi card printings actually suppress which relevant Abilities in the rank 1 Shadow Rider Calyrex reference? This is a card-text and pinned Twinleaf source analysis of effects *after their prerequisites are satisfied*. It is a test specification rather than an observed game outcome.

| Enabled opposing restriction | Underworld Door (evolved Shadow Rider VMAX, Psychic, Rule Box) | Wonder Tag (Basic Tapu Lele-GX, Psychic, Rule Box) | Climactic Gate (Basic Radiant Eternatus, Dragon, Rule Box) | Forest Seal Stone Star Alchemy |
| --- | --- | --- | --- | --- |
| Garbodor LTR 68 / BKP 57 with Tool: Garbotoxin | Suppressed | Suppressed | Suppressed | Available if Tool itself works |
| Active Iron Thorns ex TWM 77: Initialization | Suppressed | Suppressed | Suppressed | Available if Tool itself works |
| Path to the Peak CRE 148 Stadium | Suppressed | Suppressed | Suppressed | **Available** under official TPCi ruling |
| Active Klefki SVI 96: Mischievous Lock | Available | Suppressed | Suppressed | Available |
| Silent Lab PRC 140 Stadium | Available | Suppressed | Suppressed | Available |
| Active Wobbuffet PHF 36: Bide Barricade | Available, Psychic exception | Available, Psychic exception | Suppressed, non-Psychic | Available |

**Scope and conditions matter.** Garbotoxin requires its own Tool to be attached and its Ability enabled. Initialization requires an Active Iron Thorns ex; Future Pokémon are exempt. Klefki requires the Active Spot and affects Basic Pokémon. Silent Lab affects Basics even in the hand or discard pile. Wobbuffet spares Psychic Pokémon and requires the Active Spot. Path only works while that Stadium remains in play.

An Ability that triggers when a Pokémon is played **from hand onto the Bench** is checked once that Pokémon enters play. The Basic Pokémon's access is therefore sensitive to enabled on-board locks at that time. If Climactic Gate or Wonder Tag resolved *before* the lock, it is incorrect to retroactively undo the card search or Pokémon placement.

**Forest Seal Stone distinction:** Star Alchemy is an Ability on the **Tool**, and the Pokémon V to which it is attached *can use* that Ability without *having* it. The official TPCi Rules Team ruling dated 10 November 2022 confirms use through Path: [official discussion quoting ruling](https://community.pokemon.com/en-us/discussion/4212/path-to-the-peak-and-forest-seal-stone). The pinned [Twinleaf Forest Seal Stone source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts) sets its power `exemptFromAbilityLock: true`; the common locker helper respects this. An attached Stone still requires a Pokémon V target, one unused VSTAR Power, and functioning Pokémon Tools. Full board-game behavior needs a focused engine test.

**Independent restriction axis:** Budew's Item-lock attack, Vileplume AOR Item lock, Stoutland's Supporter lock, Vileplume BUS Basic-attack prevention and Snorlax's no-retreat effect do not themselves suppress Pokémon Abilities. Each changes different legal action channels. A single Boolean "locked" is inadequate as a game-state representation.

**Evidence:** [Aichi exact field manifest](full-decklists.json), [Agent 1 printing inventory](lock-threats.md), [rank 1 reference](benchmark-shadow-rider.md), [Forest Seal Stone erratum](forest-seal-stone-ruling.md), and named card classes in pinned upstream Twinleaf. Treat the matrix as expected-paper behavior until the implementation passes stateful tests.


## Stealthy Hood — paper-source scope clarification (12 November 2026)

Stealthy Hood is a local immunity layer, not a global ability unlock. Official Japanese card text says the attached Pokémon is not affected by effects of the opponent's Pokémon's Abilities. Official Q&A examples confirm that it prevents Quick Shooting damage counters and Bloodthirsty Eyes switching from affecting the attached Pokémon, while it does not bypass Hoopa's Bandit Guard effect on Hoopa itself. The same Q&A confirms that Banette's Tool Concealment does not remove Hood's effect. See the [official Hood Q&A](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E9%9A%A0%E5%AF%86%E3%83%95%E3%83%BC%E3%83%89&page=2&regulation=all) and [card text](https://www.pokemon-card.com/card-search/details.php/card/36191/regu/all).

Historical tournament precedent is unusually direct: the official [2024 Aichi Open League winner interview](https://www.pokemon-card.com/info/004426.html) reports using Hood on Pidgeot ex or Vileplume against Garbodor's Garbotoxin and Wobbuffet's Bide Barricade. The 2026 Hood/Garbodor fixture and field counterplay remain in [hood-vs-garbotoxin.md](hood-vs-garbotoxin.md) and [hood-response-field.md](hood-response-field.md).

Boundary: Hood protects only the Pokémon it is attached to from opposing Pokémon Ability effects. It does not answer attacks, Trainer effects, Stadium effects, or abilities whose effect is on the opponent's own Pokémon. The 2026 field's substantial Tool removal means the protection is removable; do not treat two copies as permanent immunity or as a demonstrated matchup win.
