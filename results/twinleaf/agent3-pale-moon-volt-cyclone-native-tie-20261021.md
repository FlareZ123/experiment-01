# Agent 3: native rank-6 Pale Moon / Volt Cyclone simultaneous-board-empty sequence

**21 October 2026. Development-only forensic evidence, not a competitive game or deck-performance comparison.**

## Exact reproducible replay

Existing manually dispatched `.github/workflows/agent7-canonical-actor-bilateral.yml`, with `special_energy_root=true`, all other optional dispatch inputs default. Git checkout `d57a08022a639d34cc87e316b33346de6909c08e`; pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Same original rank-6 source seed `407516727`, candidate physical seat A, published champion Shadow Rider 60 and exact Iron Thorns source 60. Historical seed, so no prospective inference.

- [Completed manual run 39556368105](https://github.com/FlareZ123/experiment-01/actions/runs/39556368105), expected strict verifier failure after native four-arm execution.
- Native raw artifact [12325723812](https://github.com/FlareZ123/experiment-01/actions/runs/39556368105/artifacts/12325723812): ZIP SHA256 `3bb6ac44b81c21a00694c1230873896ae7cdb9942a8415a3b889e5913d5ceb22`, internal `agent7-canonical-actor-fourarm.json` SHA256 `0a554bc29c5ad887dc019025ba238d3bc783bd49a663964548d5f9073bf539a0`.
- New read-only capture in `simulation/evaluation/agent3-native-reset-prestate.cjs`, `simulation/twinleaf/headless.cjs`, and bounded projection `simulation/evaluation/agent44-native-epoch-boundary-audit.cjs`. Uses actual native pre-dispatch public quantities, strips setup/face-down phase from root-window recording, never gives information to a playing policy. Tests `tests/agent3-native-reset-prestate.test.cjs` and `tests/agent44-native-epoch-boundary-audit.test.cjs` are in the existing manual workflow; the compiled run reached native games.

## Actual root chronology and bounded public state

The authenticated genuine Store root ledger (not a generated script of desired effects) records:

| Native ordinal | Original global turn | Acting / pending action | Public board **before** root: in-play Pokémon, physical Prize count by physical seat 0/1 |
| --- | ---: | --- | --- |
| 24 | 2 | Source seat 1 `AttackAction: Volt Cyclone` | Pokémon [1,1], Prizes [6,6] |
| 29 | 3 | Champion seat 0 `AttackAction: Pale Moon-GX` | Pokémon [1,1], Prizes [6,6] |
| 33 | 4 | Source seat 1 `AttackAction: Volt Cyclone` | Pokémon [1,1], Prizes [6,6] |
| 34 | 4 | `ResolvePromptAction: WaitPrompt` | Pokémon [1,1], Prizes [6,6] |
| 35 | 4 | `ResolvePromptAction: ChoosePrizePrompt` | **Pokémon [0,0]**, Prizes **[6,6]** |
| 36 and 37 | 4 | Two `ShuffleDeckPrompt`s | Pokémon [0,0], Prizes [0,0], after native reset preparation moved cards back to decks |
| 38 | 4 → 0 | `WaitPrompt`; native setup phase 3 → 1 | Pokémon [0,0], Prizes [0,0]; confirmed `isSuddenDeath=false → true` |

The old observation that `root38` had empty Prize zones **must not** be interpreted as six actual Prizes being taken by both players. The newly captured sequence shows all six remained in the Prize zone at root35 and moved to decks during engine reset. In particular, the last pre-reset game state with meaningful original Prizes had **both players with zero Pokémon in play**. This supports the engine's trigger for a simultaneous loss / tie and explains the turn-clock reset without treating a replay turn as original game progression.

The printed original `Trevenant & Dusknoir-GX SMP 217` Pale Moon-GX attack schedules a KO of the Defending Pokémon at the end of the opponent's next turn. `Iron Thorns ex TWM 77` Volt Cyclone deals 140; two such attacks nominally total 280 against Trevenant & Dusknoir-GX's 270 HP. These **card-text and observed action** facts make a double knockout at the end of source turn 4 a strong causal explanation. The captured count-level data **does not independently assign each KO to a specific resolved effect**, verify original damage or weakness modifiers, or certify all paper interaction semantics. Avoid presenting that particular attribution as directly witnessed.

The supplied Advanced Player’s Rulebook §I.E includes the both-no-Pokémon state as a tie, and describes a separate six-Prize Tiebreaker where a winner is required. Pinned Twinleaf's `check-effect.ts` `checkWinner` / `initiateSuddenDeath` likewise re-deals after the simultaneous points condition. That engine procedure and the tournament's exact match-clock/tiebreak policy remain **not fully paper-certified**.

## Cross-epoch identity and completeness

The observed clock marker is unique and exact: original action ordinal38, `fromTurn=4`, `toTurn=0`, `fromPhase=3`, `toPhase=1`. A separate genuine opening is observed at root46 with its own six-Prize counts `[6,6]`. Its source physical-deal digest `765b0043e6b179769ffaa371c18b2f33fbfbbd7065fdb1418fdc3df37e81aa3b` differs from the original source physical-deal digest `2ce05954cf7a87661c3dc42c242ec6c10f8c9caa9a4a60c0d3580f23613744d1`. Those are two **native game episodes inside one originally registered trial**, never two fresh tournament-match trials. The original strict bilateral root checker continues to reject cross-epoch action continuity correctly.

All original attempts were retained: rank6 champion 121 roots / reset / strict error, rank6 New Moon 75 roots / source-side engine terminal, rank11 champion 260-root cap, rank11 New Moon 260-root cap. `actorOnlyCellsWithAudits=3/4`, `competitiveQualifiedGames=0`. No candidate win-rate or 99.5% inference. See [previous unmarked-to-marked chronology](agent3-rank6-native-sudden-death-reproduction-20261021.md) and [fresh episode identities](agent3-native-replay-new-six-prize-deals-20261021.md).

## Next decision impact

This exact source/candidate collision appears to be a **real simultaneous no-Pokémon condition under the simulator's chosen policy** rather than an arbitrary clock-wrap artifact. Preserve it as a tiebreak branch and explicit censor in the common-policy qualification gate. Prioritize owner-legal game continuation, opponent response and decision competence; do not weaken strict same-epoch packet validation, pool replay episodes, or introduce a win-rate from this fixture. If paper-level KO attribution becomes critical, add a source-specific pre/end-of-turn damage/effect audit with explicit counterfactuals rather than a broad new telemetry system.


## Critical paper-timing caveat discovered after the first report (06:45 UTC)

**Do not yet interpret the simultaneous native no-Pokémon state as a legal paper tie.** Pinned upstream source reveals a possible **attack-KO versus delayed-KO resolution-order defect**:

- `ptcg-server/src/game/store/effect-reducers/game-effect.ts` `useAttack` deals attack damage and runs post-attack effects, then for a non-Barrage attack goes directly to `EndTurnEffect`; unlike the Barrage branch, it does not explicitly `checkState` to resolve KOs/game-ending conditions before EndTurn.
- `ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts` `EndTurnEffect` first runs `RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS` (including Pale Moon's delayed KO), and only **later** runs `checkState`. At that check, both sides may have zero Pokémon.
- The supplied Advanced Player’s Rulebook §I.A-01 checks KOs in attack step 7, and §I.E starts game resolution as soon as either player has no Pokémon in play. A terminal KO from damage at the end of Volt Cyclone **should trigger loss resolution before a later end-of-turn Pale Moon delayed KO**, if that attack actually Knocked Out the champion's last Pokémon.

The actual live public count trace proves both boards became empty within source t4's resolution. It does **not yet show the champion Active's live damage/HP immediately before source t4**. Printed Volt Cyclone 140 twice versus 270HP TAG TEAM, with no visible intermediate healing action in the root ledger, makes the attack KO very likely. But to claim a demonstrated **paper rules defect**, obtain an independent public damage/HP witness immediately before source's second attack and confirm the exact attack KO, prevention and phase timing. Any correction must be a reversible research-owned hook outside the pinned Twinleaf vendor submodule and tested on an authentic native trial. Until then this is a high-priority **likely paper-fidelity issue**, and the native tiebreak still requires censoring.

This caveat **supersedes any implication** above or in the initial Agent44 handoff that the tiebreak itself was necessarily a paper-correct outcome.
