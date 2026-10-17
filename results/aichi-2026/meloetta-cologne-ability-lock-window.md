# Aichi rank-26 Meloetta: first-turn Ability-lock/Cologne gate

**Agent 4, 17 October 2026. Evidence:** Pinned Twinleaf real-Store dispatch with five controlled card-interaction cases, exact source-locked 60-card opening combinatorics, and independent seeded 200,000 two-player physical-deal simulation. This is a **mechanics and resource-opportunity result**, with **zero competitively qualified games**.

## What this tests

The Aichi 2026 published rank-26 Meloetta Donk [60](full-decklists.json) contains **one Canceling Cologne**, **one Meloetta ex**, **two TM: Crisis Punch**, and **12 Basic Pokémon**. Its owner's [first-person report](https://note.com/hibi2571/n/n9f4c7d7568b8) describes a first-turn win after giving the opponent five Prizes from controlled Exeggcute self-KOs, then attacking with Meloetta ex and TM: Crisis Punch for 280 damage.

Source card interaction: Meloetta ex's **Live Debut** Ability permits attacking on the first turn going first. A live opposing Active **Iron Thorns ex** suppresses the Abilities of Rule Box Pokémon via **Initialization**; an Active **Klefki** suppresses the Abilities of Basic Pokémon via **Mischievous Lock**. Meloetta ex is a Basic with a Rule Box. Canceling Cologne is an Item that makes the opponent's Active Pokémon have no Abilities until the end of the current turn.

The [published Iron Thorns lists](full-decklists.json) at Aichi ranks 6, 24 and 29 each have **four** Basic Iron Thorns ex and therefore force that active Ability-lock source at setup. The rank-25 Alolan Raichu pilot [kume's first-person article](https://note.com/kume_pokeca/n/n6cfd126f5774) says their construction supports Klefki and describes Basic Ability suppression against Regidrago's Latias ex and Tapu Lele-GX. The **actual rank-25 registered 60 remains unavailable**. Its Klefki line here is a justified hostile-policy *hypothesis*, not a verified submitted card.

## Compiled live Store result

The [source test](../../tests/meloetta_first_turn_ability_lock.test.cjs) constructs the pinned Twinleaf `Store` with Meloetta ex Active, a source-printing opposing lone Active Pokémon, turn 1 as Meloetta's turn, `attackFirstTurn=false`, three Colorless Energy supplied by one Lightning plus one Double Colorless card, and TM: Crisis Punch attached by `PlayCardAction`. It stages exactly one opponent Prize remaining, representing the five-self-KO prerequisite separately proved in [Agent 4's full staged combo Store test](../twinleaf/damage-pump-single-source.md). The Item, when enabled, is played from hand through the real Store. The attack is announced using `AttackAction`; all engine WaitPrompts are resolved.

| Opponent's only Active | Cologne played this turn? | Pinned source result |
| --- | --- | --- |
| Shadow Rider Calyrex V | No | First-turn Crisis Punch accepted; KO, Meloetta wins |
| Iron Thorns ex TWM | No | `CANNOT_ATTACK_ON_FIRST_TURN`; no damage |
| Iron Thorns ex TWM | Yes | Crisis Punch accepted; KO, Meloetta wins |
| Klefki SVI | No | `CANNOT_ATTACK_ON_FIRST_TURN`; no damage |
| Klefki SVI | Yes | Crisis Punch accepted; KO, Meloetta wins |

Reproducibility: [manual CI run 38997503799](https://github.com/FlareZ123/experiment-01/actions/runs/38997503799) at pinned vendor SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` completed **21/21** Node tests, including all five new lock/Cologne cases and retained Damage Pump/Propagation/Crisis Punch integration tests. The added CJS file is on the established manual [Damage Pump fidelity workflow](../../.github/workflows/aichi-damage-pump-fidelity.yml). No upstream code was changed.

**Scope:** The test does not draw a shuffled registered deck, does not require the player to naturally find Cologne, and stages all energy, Prize-count and opposing board preconditions. The test establishes a real Store interpretation of a conditional card interaction. Japanese print legality and complete metagame outcomes remain separate questions.

## Additional printed access line: Forest Seal Stone under lock

The rank-26 source 60 contains **one Crobat V** and **one Forest Seal Stone**. The Tool's printed **Star Alchemy** VSTAR Power can be used by an attached Pokémon V even while the Rule-Box or Basic Ability-locking effects remove the Pokémon's own Abilities. The Ability is supplied by the attached Tool. See the existing research [Forest Seal Stone exception](forest-seal-stone-ruling.md), derived from TPCi's earlier official ruling on Pokémon V Tool Abilities; this differs from naïvely treating any Ability a Pokémon can use as an Ability it *has*. The Tool is a distinct resource, and a VSTAR Power is limited to one per game.

A new [pinned real-Store regression](../../tests/meloetta_forest_seal_cologne_bridge.test.cjs) exercised this complete staged line:

```text
Meloetta ex Active; Crobat V on Bench; Forest Seal Stone in hand
→ attach Forest Seal Stone to Crobat V
→ Star Alchemy is discoverable despite opposing Iron Thorns/Klefki Active
→ use Star Alchemy; search a live-deck Canceling Cologne
→ play retrieved Canceling Cologne on that turn
→ attach Double Colorless, attach TM: Crisis Punch
→ announce first-turn Crisis Punch; KO lone opposing Active; finish game
```

The test uses the existing reversible [Forest Seal Stone mandatory-search hook](../../simulation/twinleaf/forest-seal-search-hook.cjs), preserving the printed rule that unrestricted searches for exactly one card must select a card. The *source* pinned engine's default Stone code specifies a `min:0` prompt and would permit an illegal empty choice. The rule-corrected one-card selection here was verified with the exact source full-name printed cards.

Against both **Iron Thorns ex TWM** and **Klefki SVI**, actual `UseAbilityAction`, `ChooseCardsPrompt`, `ShuffleDeckPrompt`, `PlayCardAction` and `AttackAction` resolved successfully in [manual CI run 38998176226](https://github.com/FlareZ123/experiment-01/actions/runs/38998176226), **23/23 tests passed**, pinned SHA unchanged.

**Limitations:** Crobat V, Stone, Meloetta, Energy, Tool and the remaining Cologne were deliberately staged; prior five self-KOs were represented as one Prize remaining. The line consumes bench, Tool, once-per-game VSTAR and search resources, and real gameplay might require additional switching if Crobat is Active. Printed card mechanics make it a plausible rescue channel, but its joint opening probability, contested connector alternatives, board-space availability and success in a shuffled match are not established by the test.

## Direct Cologne access: source-locked finite-population result

The [exact calculator](../../scripts/aichi-meloetta-cologne-window.cjs) verifies the rank-26 12-Basic, one-Cologne inventory and each Iron Thorns rank's 4-Basic, four-Iron-Thorns identity against the published 60-card manifest and bundled Basic-stage index. It models independently randomized seven-card openings repeated until legal, simultaneous mulligans, six random Prize cards, every elected opposing-mulligan bonus draw up to 46, and one mandatory first-turn draw. Capping extras at 46 preserves a card for the mandatory draw; the excluded offered tail `K>=47` has probability **0.000000003557%** under this matchup profile. No Trainer, Ability, search or attack is executed.

| Directly held Canceling Cologne | Probability among valid initial Meloetta openings |
| --- | ---: |
| Starting seven alone | **10.979633%** |
| Starting seven plus one ordinary first-turn draw, no bonuses | **12.659263%** |
| Starting seven, all usable offered bonus cards, then ordinary first-turn draw | **14.966817%** |

The last improves raw first-turn hand presence by **2.307554 percentage points** relative to no bonuses. Under the two-player mulligan protocol, the Iron Thorns opponent offers at least one optional bonus with **54.885134%** probability; average accepted extras, capped at 46, is **1.373846936**. This is card access rather than card playability, and includes any Cologne that was Prized as inaccessible.

### Exact derivation

For own Basic count `b=12`, opponent Basic count `a=4`, a distinguished non-Basic singleton, and a legal 7-card starting hand:

```text
V = C(60,7) - C(60-b,7)
s = [C(59,6) - C(59-b,6)] / V
pA = C(60-a,7) / C(60,7)
pB = C(60-b,7) / C(60,7)
Pr(K>=k) = (1-pB) pA^k / (1-pA pB)   for k>=1
E[min(K,46)] = sum_{k=1}^{46} Pr(K>=k)
Pr(Cologne by first draw) = s + (1-s)/53
Pr(Cologne by first draw with accepted bonuses)
  = s + (1-s) [1+E[min(K,46)]] / 53
```

The denominator 53 covers cards not in the opening seven, including six randomized, inaccessible Prizes. Conditional on missing the singleton in seven, the first `k+1` legal draws following initial Prizing can contain it with probability `(k+1)/53` after marginalizing unknown Prize positions.

[Four deterministic assertions including an independent 200,000 physical shuffled-deal simulation](../../tests/aichi-meloetta-cologne-window.test.cjs) passed on [manual opening-audit CI 38997869223](https://github.com/FlareZ123/experiment-01/actions/runs/38997869223). The result is also emitted as `meloetta-cologne-opening.json` in that run's opening-audit artifact. The source-rank guard fails closed if the field's actual Basic or Cologne inventories change.

## Strategic interpretation and next qualification

1. **Unanswered attack-permission gate:** If the opponent starts Iron Thorns ex or active Klefki, Meloetta's printed first-turn exception is inactive while the opposing lock remains functional. The source 60 contains an Item capable of disabling that particular lock for the attacking turn.
2. **Resource access remains contested:** Only about 14.97% of ranked rank-26 openings directly hold the Cologne by their first draw under the narrow all-bonuses model against four-Basic Iron Thorns. Additional direct or connector access could change this substantially, especially if available Item search, hand refresh, or prize relocation is executable. Opposing Item lock can close those channels. No probability of `Meloetta attack succeeds` follows from the direct-hand figure.
3. **Policy coverage:** A rank-26 simulator must recognize Live Debut's dependence on ongoing Active lock, use Cologne at the correct point if found, and still solve self-KO, Tapu Koko, TM: Crisis Punch and opposing Bench constraints. An opponent model for rank 25 should keep Klefki speculative until its registered 60 is sourced and should not use the rank-25 player's *considered card options* as actual inventory.
4. **Evidence gate:** Neither controlled Store test nor opening-card calculation qualifies a full-game outcome. Any target candidate evaluation still needs independently verified complete source games, both starting seats, competent policies and current multi-layer Twinleaf state/replay fidelity.

**No qualified win rate, new optimized 60-card candidate, or 99.5% achievement is claimed.**
