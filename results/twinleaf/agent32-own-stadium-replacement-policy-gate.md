# Pinned PlayStadiumTactic forbids replacing your own Stadium

**Agent 32, 16 October 2026.** Source-locked policy audit. This measures *unconsidered candidate actions*, not guaranteed legal replacements, bot mistakes or game wins.

## Root cause

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, file `ptcg-server/src/simple-bot/simple-tactics/play-stadium-tactic.ts`, begins:

`if (player.stadiumPlayedTurn >= state.turn || player.stadium.cards.length > 0) return;`

The second condition unconditionally prevents its generic bot from **replacing a Stadium it already controls**, even though Pokémon TCG rules B-04 allow a different-named Stadium to replace it on a later turn. The tactic picks the first hand Stadium when its gate opens; it has no forward attack-enabling lookahead or explicit Stadium utility evaluation.

## Bounded field telemetry

In [source rank-6 manual CI 38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054), artifact 12022625370, **43** of 219 recorded `PassTurnAction` observations have a *different-named Stadium in the acting hand* while a Stadium belonging to that player remains in play. The stored public-board stadium owners and own-hand printings permit this check.

**Five** of the 43 observations also show a Stadium card already played earlier on the **same** turn, so the once-per-turn rule independently prohibits another Stadium. The remaining **38** have no recorded same-turn Stadium play: 6 champion:A, 8 champion:B, 16 Hood:A, 5 Hood:B, 2 Temple:A, 1 Temple:B. These are **paper-rule candidates for further checking**, not automatically legal plays: attacks such as Shadow Mist can forbid Stadiums, and source traces do not certify all effect constraints.

Example: `pilot:6:0:hood-shield-v1:B`, turn21, action187, active Iron Thorns ex with Spiky, Capture, Speed Lightning Energy. The acting player has Thunder Mountain Prism Star in hand, their own Wondrous Labyrinth Prism Star in play, and no Stadium previously played that turn. The guard prevents considering Thunder Mountain. The [counterfactual report](agent32-thunder-mountain-missed-attack-line.md) explains how swapping it could make Volt Cyclone payable but sacrifice Wondrous's powerful opposing attack-cost tax.

## Research-side correction and risks

An opt-in PlayStadium counterpolicy should consider legal **own-Stadium replacement** conditioned on game state, cost requirements, opposing attack opportunities, current lock state and once-per-turn restrictions. Merely deleting `player.stadium.cards.length > 0` from a bot tactic is unsafe: the tactic currently plays the first available Stadium, potentially discarding a tactically vital lock for no benefit. Keep the upstream submodule unchanged and stage action-acceptance tests before any performance claim.

Also see the independent [Tropical Beach -1000 scoring barrier](agent32-tropical-beach-scoring-root-cause.md), which blocks voluntary use of an already active Stadium that ends the turn.
