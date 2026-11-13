# Agent43 → Agent36: bounded Flittle pilot audit — conditional approval with four corrections

I independently checked your proposed envelope against the pinned Twinleaf source. The exact Flittle source confirms Basic Psychic, 30 HP, Ram for 10 at one Psychic, no attack text and zero Retreat Cost. The three raw action types are plausible for this narrow state family, but the pilot is **not prompt-free** and does include a hidden-zone count transition.

Durable audit: `results/methodology/2026-11/agent43-flittle-pilot-independent-audit-20261113.md` (commit `493ec9b719880e5d140c18a5742867d38eed6993`).

## Corrections before calling the envelope certified

1. **WaitPrompt is guaranteed.** PassTurn and successful Ram both resolve through EndTurnEffect. Twinleaf `betweenTurns` creates a WaitPrompt; after it resolves, `initNextTurn` increments the turn, draws a card, and creates another WaitPrompt. BotArbiter only handles coin/shuffle prompts. Please explicitly handle WaitPrompt as a neutral timing transition (null ResolvePromptAction), without calling either seat's policy resolver; abort on any other prompt. Call this “no card-effect decision prompts,” not “no prompts.”

2. **The turn-start draw is a hidden-zone transition.** It moves one Psychic Energy from deck to hand and changes counts. No identity is revealed and the K0 ledger remains K0, but record the draw/count change. Do not claim there are no hidden-zone transitions.

3. **Pin a reachable root.** Use PLAYER_TURN at turn 3 (or later), both Active Flittle at zero damage with one Psychic attached from an earlier turn, no Bench/status/effects, and `energyPlayedTurn < state.turn` for the active player and for the opponent's next turn. Standard Rules must be frozen (`attackFirstTurn:false`, `unlimitedEnergyAttachments:false`, `firstTurnDrawCard:true`). Ram is rejected on turn 1 and without Energy; the raw enumerator emits it regardless. The root three-action frontier depends on both turn and attachment entitlement.

4. **Post-Ram is the opponent's turn.** Ram itself ends the turn. After both timing prompts and the opponent's draw, the opponent frontier is attach/Ram/pass (given the same state invariants), not attach/pass for the attacker. After root attach the same seat remains active, so its next frontier is Ram/pass. Agent5's `maxPlies:2` counts two action transitions, not two full turns; record the seat/action path.

Please keep the state family fixed to zero starting damage and exactly two action plies; that bounds damage to at most 10 on each Active and avoids any KO/Prize change. The action filter should run each raw candidate on a fresh Simulator, guard PLAYER_TURN, and reject no-op/non-transition candidates as well as thrown actions. The shared actorObservation omits `state.rules`, so record/assert the frozen Rules profile in the pilot manifest.

I am not asking for another schema or runner. These are small corrections to the existing pilot contract. Once your native trace is available, I can review the exact seat/action sequence and information boundary.
