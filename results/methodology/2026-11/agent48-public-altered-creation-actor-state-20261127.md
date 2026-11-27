# Actor-visible Altered Creation damage/bonus-Prize effects (rank19 ADP)

**Agent:** 48  
**Date:** 2026-11-27 UTC  
**Category:** typed native-State-to-worker public effect projection  
**Benchmark status:** no actual native match or win-rate data.

## Problem and engine evidence

Aichi rank19 fields an ADP-GX deck. Its `Arceus & Dialga & Palkia-GX CEC156` `Altered Creation-GX` creates **two distinct persistent public game effects**:

1. `player.alteredCreationDamage = true` from using the GX move, increasing damage dealt by that player's attacks to opponent Active by 30 for the rest of the game (subject to later removal of attack effects).
2. `player.usedAlteredCreation = true` **only** if the GX attacker had the extra Water when Altered Creation was used; this makes an eligible opponent's Active Pokémon Knock Out **by attack damage** award one additional Prize.

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements both separately in `ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/arceus-dialga-palkia-gx.ts`: one branch modifies `DealDamageEffect`, another applies `KnockOutEffect.prizeCount += 1` only during attacking player's own attack phase against opposing Active. Neither flag is a concealed-card identity: the GX attack announcement and extra attached Water are public in paper play. `Pokémon Ranger STS104` can remove attacks' player/Pokémon effects according to printed text and pinned `pokemon-ranger.ts`; an engine-native post-Ranger state must be re-observed.

Previously, `actorObservation(state,seat)` omitted both persistent effects, giving candidate workers no trusted public evidence for modified damage or Prize thresholds, potentially making the same board state appear strategically identical despite different opponent Prize-race threats.

## Implemented mainline result

- `simulation/twinleaf/actor-observation-contract.cjs` now emits `ownPublic.publicTurnRestrictions.alteredCreationDamage`, `.usedAlteredCreation`, and analogous opponent-side fields directly from the correct physical `player` object. Unset flags project as false. The public fields do not read either player's concealed cards or deck.
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` authorizes these keys under `PLAYER_RESTRICTION_OPTIONAL_KEYS` and rejects non-boolean values when supplied. They are optional to avoid rejecting old frozen protocol fixtures with no ADP field.
- `tests/agent48-public-altered-creation-flags.test.cjs`: three targeted current-main CommonJS V8 tests cover both actor seats with distinct combinations (+30 without +Prize), typed protocol acceptance/rejection, legacy omission, and independence from opponent hidden hand/deck/Prize identities. **3/3 passed.** This is isolated source-level execution, not Node CLI / native Store / gameplay evidence.

Commits `46107ad8d2a17d169efe781ca10fd2327e6acf5a`, `5afe6b5b41b437436449541f28b8db21d20b0d95`, `c3ca11e2e2d9442065f71e1391fd078f13d8544c`.

## Downstream policy contract

Owner two-profile policies can now (with exact authenticated actor views) use these facts to estimate (a) opponent attack damage +30, or (b) extra Prize **on eligible Active attack-damage Knock Out**. Keep separate base printed Prize liability from such conditional attack/player modifiers. An effect-driven KO from damage counters (e.g. Astral Barrage) does **not** automatically trigger the same bonus. Also avoid treating an announced Altered Creation without the extra Water as +1 Prize, and never read opposing concealed Energy from a deck to reconstruct it.

The mainline change is strictly an *information interface*, **not** a claim that candidate policy now acts on these flags or that native game outcome probabilities have improved. Handoff sent Agent46 and Agent31 `communications/agent46/2026-11/20261127T204759075Z_agent48-public-adp-flags.md` (and counterpart Agent31). Frozen candidate decks, owner-controlled V3 game/CI, and vendor Twinleaf were not changed.
