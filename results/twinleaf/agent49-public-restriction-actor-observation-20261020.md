# Agent 49: public status and attack legality inputs for actor-only decisions

**20 October 2026, normal Agent 49.** Source repo `FlareZ123/experiment-01`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is **decision observation infrastructure**, not a game-rule patch, intelligent bot, or competitive performance result.

## Problem and implemented boundary

The frozen actor-only interface `simulation/twinleaf/actor-observation-contract.cjs` already exposes printed Pokémon identities, printed attack costs, owner hand, public boards, hidden-zone **counts**, owner-prompt search indication and nine owner play-lock flags. However, an attack or retreat planner could not see a Pokémon's present Special Conditions or its temporally blocked attacks, and could not see the public opponent-side player-wide lock flags. An otherwise information-set-constrained future policy might incorrectly assess a retreat or attack as available because its input omitted those public constraints.

Using only live public `PokemonCardList` and `Player` fields from the pinned vendor source, Agent49 added:

- Per **face-up** Active/Benched Pokémon: detached `specialConditions`, `cannotAttackNextTurn`, `cannotUseAttacksNextTurn`, `blockedAttackNameNextTurn`, `blockedAttackNameUntilLeavesActive`, `onlyAllowedAttackNameNextTurn`, `cannotRetreatNextTurn`, `cannotRetreatWhileActive`, and `cannotEvolveNextTurn`.
- For **both** players: frozen public `gxUsed`, `vstarUsed`, `attackLockTurnsRemaining`, `attackMaxEnergy`, `cannotUseGXAttacks`, plus the complete nine player-level card-play locks. The original `ownTurnResources` projection remains intact for compatibility.
- Zero opponent hand/deck/Prize identity reads. No own hidden deck/Prize identity reads. Every new array is copied and recursively frozen. The fields denote board state and announced prohibitions only; actual legality remains a Store decision involving other printed effects, modifiers, card history and applicable locks.

Code commit [6c5efa38](https://github.com/FlareZ123/experiment-01/commit/6c5efa38085d4046bf70fdb75093050a2a748b56); independent hidden-world and mutation-safe regression additions commit [fec47764](https://github.com/FlareZ123/experiment-01/commit/fec47764ed9f5ccaa8fdb64b6d6132b8f7bbee8b).

## Compiled verification

Manual compiled [workflow 39455700351](https://github.com/FlareZ123/experiment-01/actions/runs/39455700351) **passed** on main `d99e24e6af2119cb93edb26bafffbc8b1f6d550c`, including the expanded `tests/actor-observation-contract.test.cjs` before engine installation and native same-pinned-engine comparison after compilation. Pinned source was checked out at the submodule revision above. The native `agent21-actor-observation-compiled.cjs` replay of four historical source-dealt games certified its *own read-only observation boundary*: **4/4 games** matched existing complete canonical result rows with **842** original Store root dispatches, **834** actor decisions, **520** actor prompts and **8** authenticated first owner deck searches. Source-deal and original root-action ledgers were unchanged. The full archived compact observation record is artifact [12281001722](https://github.com/FlareZ123/experiment-01/actions/runs/39455700351/artifacts/12281001722), ZIP SHA256 `bbab57858a1cc06174665cba43a8dbbcc6bf3b408e9a63337750adf5a657a558`.

The two appended synthetic tests specifically verify that an opponent's temporary attack/retreat restrictions and player-wide locks are visible to the actor, deeply detached, and retain the exact actor view when concealed opponent hand/deck/Prize **identities** change at constant counts. The historical Store smoke validates noninterference with the expanded observation surface; it does **not** attest that any individual restriction was naturally active in those four games. A native positive-effect State fixture remains worth adding when the canonical owner policy consumes these fields.

## Interpretation and next integration gate

The official advanced rulebook supplied in this research explicitly forbids attack announcement while the Active Pokémon is Asleep or Paralyzed and generally forbids retreat for those conditions. The source `PokemonCardList` exposes `specialConditions` and other announced prohibitions. These fields should be inputs to an owner-observation-based **candidate decision** generator; translate selected intent to actual live Store actions only after the policy makes its choice, with Store legality as the final veto. The public projection can inform conservative action rejection; it must not presume that a negative prohibition flag automatically makes an attack possible.

Agent41's present canonical common policy still delegates many decisions to unmodified `SimpleTacticsAi`, which is known to score concealed information. Thus `hiddenInformationSafe:false` remains mandatory until the whole candidate and opponent decision path, including copied attacks, Search/Prize K0/K1 and fallback actions, uses an authenticated information-set-safe interface. The report implies no completed competitive matchup, deck win-rate, 99.5% claim or change to rank-field exact-source coverage (**29/32**).

**Source:** pinned vendor `ptcg-server/src/game/store/state/pokemon-card-list.ts` and `player.ts`; test `tests/actor-observation-contract.test.cjs`; native evidence and job logs at the linked workflow.


## 16:30 UTC extension: fully face-up printed tactical fields

The same actor-only `visiblePokemon` object now additionally supplies a separate detached `printed` structure with Pokémon stage, type(s), printed retreat-cost symbols, Weakness and Resistance, together with printed attack damage, damage-calculation marker, attack text, GX/barrage identifiers and the Power type/text. Older `attacks[].name/cost` and `abilities[]` retain their prior meaning. The print's absent Weakness multiplier is represented as `null`, in accordance with the pinned `Weakness.value` optional field; actual calculation is still deferred to Store. The display contains only information printed on cards already face-up in play, excluding physical concealed zone identities.

Code [b75014ca](https://github.com/FlareZ123/experiment-01/commit/b75014ca8a07c544a4e75f5dfd56e20ac0179914), detached-type/damage mutation regression [31f2b14e](https://github.com/FlareZ123/experiment-01/commit/31f2b14e60e5f9b7fb1eb7191443c05860afe807).

A **second full compiled manual observation pass** [39457609426](https://github.com/FlareZ123/experiment-01/actions/runs/39457609426) at commit `cc4b372043ca93d766657537380be1f5bc5d112e` passed the expanded synthetic test suite, pinned Twinleaf compilation and original historical four-game noninterference. Counters and qualifications remained **4/4 canonical row matches**, **842** real Store root actions, **834** actor decisions, **520** prompts and **8** first-owner searches. New artifact [12280673431](https://github.com/FlareZ123/experiment-01/actions/runs/39457609426/artifacts/12280673431), ZIP SHA256 `da7147db4173ca757f2fe2c38b0a2e00b4c4e961685168a9d5c9cb2b02556d79`. This still provides no full policy competency or hidden-information-safe game result.
