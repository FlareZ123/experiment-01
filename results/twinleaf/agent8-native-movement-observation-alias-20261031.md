# Public turn-movement history is absent from the owner-only decision view

**31 October 2026 | Agent 8 | normal mode | evidence status: DEVELOPMENTAL**

## Exact unresolved information boundary

Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` defines `MOVED_TO_ACTIVE_THIS_TURN(player,pokemon)` as checking whether `player.movedToActiveThisTurn` contains that Pokémon's native ID. The pinned Mega Lopunny ex PFL 84 implementation calls that helper to add **170** to its **60** Gale Thrust damage. The helper's tracked IDs are maintained by the engine and cleared at turn start.

`simulation/twinleaf/actor-observation-contract.cjs::visiblePokemon` provides the acting policy with face-up attack text, printed damage/cost, attached Energy, temporary restrictions and evolution date. It does **not** expose the public fact that the Active Pokémon moved from its Bench during the current turn. Two real games with the same present face-up board and owner hand can therefore produce identical detached observations while having different eligible Gale Thrust damage. The historical move is physically public; making the actor guess from the printed attacks alone is an avoidable information loss.

**Scope and reproducibility:** `tests/agent8-rank15-movement-observation-alias-native.test.cjs` (commit `366d1ef4b9e4f2f76dc7e51b0b968968050362f2`) is a new two-seat pinned native **regression awaiting execution**. It creates the same real Store face-up Mega Lopunny/Grass/Shadow Rider VMAX board twice, manually stages the engine's move-history marker in one fork, checks exact detached observation equality, and attempts real Gale Thrust settlement at **60 versus 230** damage. Staging the marker isolates the engine's observation contract; this is not a naturally shuffled game or proof of a native history-generating action. Its pass/fail remains **unverified** until compiled CI executes the new file.

## Independently compiled genuine source-action evidence

The existing original rank-15 `tests/agent8-rank15-guzma-energy-reversal-pinned-native.test.cjs` has already passed in **both physical seats** under the full canonical manual [CI 41147872138](https://github.com/FlareZ123/experiment-01/actions/runs/41147872138), as has `tests/agent8-rank15-mixed-energy-pinned-native.test.cjs`. These genuinely settle native Store actions. A stationary Mega Lopunny with Grass Energy uses Gale Thrust for **60** and with DCE uses Spiky Hopper for **160**. A genuine source-printed Guzma BUS action moves Mega Lopunny from Bench to Active on the same turn; Gale Thrust then does **230** with Grass **and with DCE**, while Spiky Hopper remains **160**.

Thus movement reverses the stronger *attack option*. It does **not** establish that Grass becomes a preferable *attachment* after Guzma, since DCE still funds Gale Thrust. The existing `specialFundsImmediateAttack` heuristic conservatively keeps Grass if any Basic-funded damaging attack is available. The stationary 60/160 contrast identifies a blind spot in ranking immediate attacks. Both findings are isolated, staged development controls, with zero measured competitive wins.

## Broader incidence in supplied complete card archive

A reproducible offline textual scan of the provided `card-list.zip` examined **20,635** English card records (including earlier non-Expanded printings). A phrase-pattern search for attacks whose effect mentions moving between Bench and Active in the same turn found **28 distinct printing records comprising 11 attack-text families**. This is a bounded text search, not a verified exhaustive rule-semantics classification. The observed families: Mega Lopunny ex Gale Thrust, Rayquaza Breakthrough Assault, Golisopod First Impression, Keldeo ex Gale Thrust, Palafin Justice Kick, Revavroom ex Accelerator Flash, Mawile VSTAR Sudden Eater, Hoopa Assault Gate, Dragapult V Jet Assault, Rapid Strike Urshifu VMAX Gale Thrust and Accelgor Ninja Tornado. Some are conditional damage, some attack failure, and Accelgor changes cost. The source archive contains entries outside legal Expanded, so raw pool counts are **not legality counts**.

Crosschecking those 11 names against the **29 exact original opposing Aichi source 60s** in `results/aichi-2026/full-decklists.json` finds only **rank 15 Ryotaro Nozawa** with two Mega Lopunny ex PFL #84. This is a narrow source-field exposure for the exact phrase family, while the architectural turn-history limitation could affect other event-dependent strategies.

## Minimum actor-safe correction and falsification

1. Have the trusted Store-to-actor boundary expose **per-public-Pokémon moved-to-Active-this-turn** as `boolean|null` tied to the actual native Pokémon and current turn; `null` means history unavailable, not false. This field comes from the authenticated native movement ledger and may not expose owner deck or opponent concealed cards.
2. At the same owner root, compare Grass/DCE attachment and the attacks each funds using a bounded, explicitly qualified same-root proposal set. Preserve the original first-return selector as a control and retain an unknown branch when effects, Weakness or cost modification cannot be evaluated safely.
3. Execute the new two-seat movement-observation regression in an **existing manual-only workflow**, then verify a **real Guzma-generated** history marker, observed printings, genuine Store actions, last-root completion and an independently responding opponent. The latter is required before treating the policy as competitively tested.

This result was handed directly to Agent41 in `communications/agent41/20261031T0055Z_agent8_rank15_move_history_observation_gate.md`. No source or common-choice policy has yet been altered. The main qualification gate remains **29/32 exact opponent 60s, zero competitively qualified games, no demonstrated 99.5% deck**.
