# First-player setup choice and first-turn rules

**Agent37, 2026-11-07.** This note records a source-validated rule contract relevant to the first pending setup `ConfirmPrompt` in the native headless runs. It does not establish a deck preference or competitive result.

## Runtime prompt source

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- `ptcg-server/src/game/store/state/state.ts` defines `GamePhase` in enum order: `WAITING_FOR_PLAYERS=0`, `SETUP=1`, `PLAYER_TURN=2`.
- Both `ConfirmPrompt` constructors in `ptcg-server/src/game/store/reducers/setup-reducer.ts` use `GameMessage.GO_FIRST`: the alternative setup path around line 118 and the standard setup path around line 395.
- Each path first invokes `WhoBeginsEffect`. When it does not select a player directly, Twinleaf issues `CoinFlipPrompt(SETUP_WHO_BEGINS_FLIP)`, then asks the coin-flip winner to choose whether the winner goes first.
- The prompt owner is the coin-flip winner. A boolean `true` chooses the coin-flip winner to go first; `false` chooses the other player to go first.
- The canary receipt in run [42414095164](https://github.com/FlareZ123/experiment-01/actions/runs/42414095164) records turn 0, phase 1, and pending `ConfirmPrompt`, with root-action prefix length 1. The separate Agent36 real-headless test in run [42413547309](https://github.com/FlareZ123/experiment-01/actions/runs/42413547309) fails at the same pre-root prompt class before reaching its Snap Trap fixture.

The source mapping makes `GO_FIRST` the leading explanation for these failures. Neither runtime receipt records `prompt.message` or `prompt.playerId`, so the exact prompt identity remains unconfirmed. A bounded pending-prompt receipt should record the message and owner seat, together with the preceding accepted coin-flip result. Do not infer a Trainer-root failure from this setup prompt.

## First-turn rules and simulation settings

The official Pokémon Card Game Japan play guide states that a player going first cannot use a Supporter on their first turn. The official rulebook PDF also states that the first player cannot attack on that turn. The official 2019 rules announcement describes the Supporter restriction as a game-rule change effective 2019-11-29; its later note about Extra and Hall of Fame concerns format/card-pool regulation changes, not an exemption from the preceding game-rule change.

Sources:
- Official current play guide: https://www.pokemon-card.com/howtoplay/
- Official 2019 rule-change announcement: https://www.pokemon-card.com/info/2019/20190922_002095.html
- Official Pokémon TCG rulebook PDF describing the first-turn attack restriction: https://www.pokemon-card.com/assets/document/manual.pdf

At research commit `acafbbbd92bedb1344299214a1a96e95c6e8d51b`, `simulation/twinleaf/headless.cjs` explicitly sets:
- `firstTurnDrawCard = true`
- `firstTurnUseSupporter = false`
- `attackFirstTurn = false`

These settings align with the official first-turn restrictions. The repository transcription `resources/manual/EN_advanced_manual-2025-transcription-structured.md` covers the one-Supporter-per-turn rule around lines 432-449 and setup around lines 629-675, but does not explicitly state the first-player Supporter restriction in those sections. This is a documentation gap in the transcription, not evidence that the restriction is absent. The same manual's first-turn attack exception example around line 2863 is consistent with the general first-turn attack restriction.

## Implications for the shared policy

1. A setup resolver should handle only `ConfirmPrompt` with `message===GameMessage.GO_FIRST` and the matching acting player. All other unknown ConfirmPrompt instances should remain fail-closed under Agent4 quarantine.
2. The handler's response must be a real native `ResolvePromptAction` carrying a boolean. A test fixture may use an explicitly recorded fixed choice to reach its intended component test.
3. Tournament policy should make the choice from the fixed deck's own first-turn plan. There is no universal always-first or always-second conclusion from these rules alone. The first player gives up first-turn Supporter and attack access; the second player retains both.
4. Evaluate the fixed deck in both first-player and second-player positions across the opponent field. The coin-flip choice is part of the playing policy and must be held constant across paired candidate comparisons.
5. The existing `captureSetupCoinChoiceReceipt` helper in `simulation/twinleaf/agent16-setup-coin-choice-receipt.cjs` is postdispatch-only and owner-independent. In `headless.cjs`, it is attached to Store-dispatch errors, but the bot-decoder failure path currently omits it. The decoder-failure receipt should attach this partial coin evidence and a detached pending prompt message/owner-seat record without exposing raw State/Store or hidden zones.

## Evidence classification

- **Official rules fact:** first player cannot use a Supporter on their first turn; first player cannot attack on their first turn.
- **Pinned simulation configuration:** headless uses `firstTurnUseSupporter=false` and `attackFirstTurn=false`.
- **Source-supported hypothesis:** the turn-0/phase-1 pending ConfirmPrompt in the two recent runs is the setup `GO_FIRST` choice.
- **Not established:** runtime prompt identity until `message` and `playerId` are captured; optimal first/second preference for any candidate deck; any completed competitive game or matchup result.

No deck qualification or win-rate claim follows from this note.


## Follow-up: existing owner-safe handlers and wrapper composition

A later audit found that the repository already has two suitable setup handlers:

- `simulation/twinleaf/agent4-owner-setup-confirm.cjs` exports `withOwnerSetupConfirm`. It is explicitly documented to install after the raw-State fallback quarantine and before canonical actor adapters. It handles a matching owner `ConfirmPrompt` in phase 1 / turn 0, uses an actor-only observation, validates and submits a native `ResolvePromptAction`, defaults to false, and records owner-visible prompt message codes.
- `simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs` handles `ConfirmPrompt` with `message==='GO_FIRST'` as false with reason `go-first-default-second`. Its audit records the message, owner seat, decision and settlement.

The selected v8 policy already composes the second handler: `simulation/evaluation/agent36-issue25-v8-owner-ability-policy.cjs` wraps the run with `withOwnerAbilityConfirmPolicy`, and `simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs` calls `runIssue25V8WithOwnerAbilityPolicy` in `runPhase` around line 532. Therefore the selected v8/v10b path already handles GO_FIRST. Its turn-54 failure is a distinct later prompt issue.

The Agent2 direct actor-only canary and the standalone Agent36 Snap Trap integration test fail at setup because their wrapper compositions omit the existing setup-confirm layer. These failures are composition gaps in those diagnostics; they are not evidence that the selected v8/v10b policy is blocked at GO_FIRST. For the direct Snap Trap fixture, reuse the narrow `withOwnerSetupConfirm` helper. For the Agent2 canary, place the same helper after quarantine and before `withActorOnlyRootPolicy`. Keep all other unsupported prompts fail-closed. No new prompt handler or CI lane is needed.

The setup prompt's exact runtime message remains unconfirmed in the two direct failed runs because neither includes the owner-confirm audit. The existing setup helper records message codes, while the v8 ability-confirm helper records confirm events. The postdispatch `captureSetupCoinChoiceReceipt` attachment gap on bot-decoder errors remains a separate observability issue.
