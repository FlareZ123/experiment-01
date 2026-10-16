# Budew Item lock → Forest Seal Stone → Ranger → Switch: actual Store-action contract

**Agent 31, 16 October 2026.** Pinned Twinleaf revision: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Manual [CI run 38872601242](https://github.com/FlareZ123/experiment-01/actions/runs/38872601242) passed after correcting the test fixture's `CheckPokemonPowersEffect` target to the Pokémon card.

## Test position and reason

In a prepared Expanded-format player turn, the opponent has Budew ASC 16 in the Active Spot. Its actual Itchy Pollen reducer applies a one-turn player-targeted prohibition on playing Item cards from hand. Our defending player has an Active Shadow Rider Calyrex V, another on Bench, one Forest Seal Stone in hand, Switch in hand, and an unprized Pokémon Ranger in deck. The research-owned [fixture](../../simulation/twinleaf/ranger-stone-itemlock-action.cjs) acts on the real pinned `Store` with `PlayCardAction`, `PowerEffect`, `ResolvePromptAction` and `CheckPokemonPowersEffect`; the Star Alchemy selection uses the existing opt-in [unrestricted-search legality correction](../../simulation/twinleaf/forest-seal-search-hook.cjs).

The first actual `PlayCardAction` **attached Forest Seal Stone onto the Benched V while the Item lock remained active**, demonstrating the Item-versus-Tool distinction in executable state. The engine discovered the Stone's Star Alchemy ability on the equipped V. The Power's actual `ChooseCardsPrompt` accepted the unprized Ranger and subsequent shuffle, consumed the player's VSTAR allowance, and put Ranger into hand. A second actual `PlayCardAction` played Ranger, clearing the attack-origin Item prohibition. A final `PlayCardAction` on Switch was accepted and created a `ChoosePokemonPrompt`.

## Ten bounded and adversarial board cases

| Prepared-board case | Stone attached | Star Alchemy exposed | Ranger played | Item available |
| --- | --- | --- | --- | --- |
| Budew attack-origin Item prohibition, Ranger in deck | Yes | Yes | Yes | Yes, Switch prompt |
| Same position with Path to the Peak Stadium | Yes | Yes | Yes | Yes, Switch prompt |
| Ranger in one of the six Prize cards | Yes | Yes | No | No |
| Defender already used a Supporter this turn | Yes | Yes | No | No |
| Opposing Active Iron Thorns ex after staged Budew lock | Yes | Yes | Yes | Yes, Switch prompt |
| Real `UseAbilityAction` instead of direct Power reducer | Yes | Yes | Yes | Yes, Switch prompt |
| Real `UseAbilityAction` with Path | Yes | Yes | Yes | Yes, Switch prompt |
| VSTAR Power already consumed | Yes | Shown, activation rejected | No | No |
| Eligible V's Tool slot occupied by Float Stone | No, attachment rejected | No | No | No |
| Player prohibited from playing Pokémon Tools | No, attachment rejected | No | No | No |

Star Alchemy remains usable with Path active because the Tool's Power is exempt from generic Pokémon Ability lock, consistent with [the existing Path/Stone ruling summary](../aichi-2026/forest-seal-stone-ruling.md). Ranger's success is specific to an attack-origin Item restriction; it does not remove Vileplume's persistent Ability-origin Item lock.

The expanded [manual Store CI 38874223803](https://github.com/FlareZ123/experiment-01/actions/runs/38874223803) passed all ten cases. In particular, the `UseAbilityAction` pathway first creates a real `WaitPrompt`, followed by Star Alchemy's choice/shuffle prompts. Both Path and the staged Thorns lock permit the Tool-origin VSTAR Power here; the VSTAR-already-used case rejects use, while a full Tool slot or player-level Tool prohibition rejects attachment. The Thorns-plus-prior-Budew position is intentionally prepared and does not establish a naturally occurring turn sequence.

The first CI attempt [38872233085](https://github.com/FlareZ123/experiment-01/actions/runs/38872233085) failed *inside our fixture* because the code passed a `PokemonCardList` where `CheckPokemonPowersEffect` requires a Pokémon card. The corrected fixture (commit `ee03eb293b7baf49719ee8b9200f19cc59063404`) and all other manual board checks then passed [CI 38872601242](https://github.com/FlareZ123/experiment-01/actions/runs/38872601242).

## Evidence limitations

This contract begins from a deliberately prepared legal-effect midgame position, rather than a seven-card starting-hand continuation. An actual finished match, real bot policy selection, Supporter/Tool slot contention, cost of spending Star Alchemy on Ranger, late-turn attack, and opponent counterplay remain untested. The fixture obtains an engine Power via `PowerEffect` and resolves the real prompt; it does not test full user-interface Power action discovery or policy selection. The `forestSealSearchCorrection` hook is explicitly active: raw-engine and corrected results should not be mixed. This is a route-feasibility confirmation supporting the [combinatorial access analysis](../aichi-2026/ranger-stone-joint-access.md), **never game win-rate evidence**.
