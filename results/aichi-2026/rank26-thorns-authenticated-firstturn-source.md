# Rank-26 Meloetta versus rank-6 Iron Thorns: authenticated first-turn source opening

**Agent 4, 17 October 2026. Evidence class:** real pinned-engine initial-state replay, source-dealt printed 60s, deliberately selected seed. **No legal completed attack, outcome or competitive win rate.**

## Why this case matters

Earlier work measured Canceling Cologne access by direct draw, Order Pad heads, and Forest Seal Stone + Crobat V in the published rank-26 60. Those marginal access opportunities do not show a playable attack. This investigation supplies a concrete root-store first-turn state from two complete tournament-source 60s that can anchor an intervention and opposing-response test. The recorded root is after legitimate opening setup, resolved mulligans/Prizes and the first ordinary draw, before the first normal turn policy action. The first player's identity is verified against the first draw log.

## Frozen source identities and exact replay

- Attacker: rank **26**, Hibiki Yamada's published **Meloetta Donk** 60, as mapped in [full-decklists.json](full-decklists.json) by `planAichi(26, {allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true})`.
- Opponent: rank **6**, Kazuma Kashi's exact published four-Basic **Iron Thorns** 60.
- Pinned engine: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source replay: `aichi-decorrelated-slots-v3`, phase `pilot`, rank 26, base **20261018**, repeat **86**, physical candidate seat **B/1**, seed **49957955**.
- Actual first player: seat **B/1**, `research-B`; `LOG_PLAYER_DRAWS_CARD` also reports `research-B`, so starting-order attribution is independently corroborated.
- Root state was replayed with the same source 60s, physical seat, seed and policy options and checked for exact detached JSON equality.
- [Implementation](../../simulation/twinleaf/meloetta-rank26-firstturn-source-window.cjs) and [three classification tests](../../tests/meloetta-rank26-firstturn-source-window.test.cjs).
- Manual [compiled run 39073670175](https://github.com/FlareZ123/experiment-01/actions/runs/39073670175), artifact [12116470390](https://github.com/FlareZ123/experiment-01/actions/runs/39073670175/artifacts/12116470390). Existing source fidelity tests **27/27 passed**, root classifier tests **3/3 passed**, first-turn scan, rerun-equality check and JSON artifact upload passed.

## Actual player-visible start

| Property | Authenticated root |
| --- | --- |
| Own Active | Meloetta ex SV11B |
| Own Bench | Unown AOR |
| Opposing Active | Iron Thorns ex TWM |
| Opposing Bench | empty |
| Own Prize count | 6 |
| Opposing Prize count | 6 |
| Own hand after mandatory draw | Quick Ball FST; Lightning Energy MEE; Trainers' Mail ROS; Hisuian Heavy Ball ASR; Canceling Cologne ASR; Dowsing Machine PLS; Bicycle PLS; Damage Pump LOR |
| Direct lock-breaking Item | **Canceling Cologne in hand** |
| Risky Ruins in hand | 0 |
| Damage Pump in hand | 1 |
| Order Pad in hand | 0 |
| Forest Seal Stone in hand | 0 |
| Crobat V in hand/Bench | 0 |

This provides the printed preconditions for a genuine **Cologne play**, while other essential pieces remain to be accessed and paid for. Prized card identities were excluded from this decision snapshot, except for the separate post-hoc Boolean on the source Cologne singleton, which is in hand and therefore not Prized.

## Important turn-order and Bench-position correction

The published Tapu Koko Prism Star **Dance of the Ancients** Ability attaches Lightning Energy from the discard pile to **Benched Pokémon**. Meloetta ex is already in the Active Spot in this sourced deal. Its required third Energy for Technical Machine: Crisis Punch is ordinarily obtained by using Koko to attach Lightning to Meloetta **while Meloetta is Benched**, alongside the normal attachment of Double Colorless Energy. The source list contains no evident alternative Energy-acceleration card for a permanently Active Meloetta.

Consequently, **this initial-Active Meloetta cannot directly receive Koko's Lightning**. A line using the ordinary Koko plus Double Colorless configuration must first move Meloetta to the Bench, accelerate there, and promote it back to Active. Potential source-deck movement channels include the singleton Escape Rope, singleton Float Stone on a replacement Active Pokémon, or recoverable/replayable switching effects subject to their costs and card-access constraints. Whether any particular such line is available in the physical seed has **not** been established.

This materially limits the interpretation of the earlier [initial-Meloetta opening and Cologne access model](meloetta-stone-pad-joint-access.md). Seeing Miloetta initially and reaching Cologne is an independently valid resource event; it is **not an automatic attacker-energy setup**. Initial position is a strategic constraint, not just a convenient way to avoid locating an attacker.

Also, Tapu Koko Prism Star carries the Prism Star Rule Box, and printed Active Iron Thorns ex **Initialization** disables non-Future Rule-Box Pokémon's Abilities. Thus an otherwise reachable Koko Ability can itself be suppressed until a legal lock-breaking effect applies. The pinned card sources at `ptcg-server/src/sets/08-sun-and-moon/set-team-up/tapu-koko-prism-star.ts` and `ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts` contain the corresponding printed effects; the pinned `Card.hasRuleBox()` includes `CardTag.PRISM_STAR`. A prepared [rank-26 Cologne/Live Debut fixture](../../tests/meloetta_first_turn_ability_lock.test.cjs) separately demonstrates that a played Cologne disables the Iron Thorns first-turn Ability gate under staged attack-ready resources, but does not model this physical hand.

## Seed search limits

The search examined **374** first-turn root setups across predefined seed bases, repeats and physical seats, stopping at the first observed Meloetta-first, lone-Iron-Thorns, Meloetta-Active, direct-Cologne opportunity. Of those inspected, **182** gave rank-26 the actual first turn; **14** had Meloetta actually Active on such turns. These are **descriptive counts from a truncated, conditionally stopped seed search**, not a random sampling protocol for a game-win fraction or standalone opening probability. The separately recorded first Pad-only/eligible opening uses seed **2715412072**. No attack or relevant opponent reply was sampled. The exact source lists, simulator hooks, turn and seed are preserved so a competent decision policy can now be evaluated with the same starting state.

## Necessary next falsification

Replay seed **49957955** with source 60s, candidate in physical B, using a real Store action to play its held Canceling Cologne on turn 1. Capture (1) printed Item use, (2) resulting Iron Thorns Ability-lock state and Koko access, (3) the legally available search/discard/Bench movement lines in the physical hand, and (4) a credible response from the registered opponent. State the **first exact card, Energy, Tool-slot, Bench, or sequencing blocker** if the five-self-KO Crisis Punch cannot be reached. Repeat for an attacker-Benched starting configuration without pretending it is the same physical seed.

Any result from these staged or source-dealt diagnostics remains unqualified as a competitive game until a competent adversarial policy and complete-source gameplay succeed.
