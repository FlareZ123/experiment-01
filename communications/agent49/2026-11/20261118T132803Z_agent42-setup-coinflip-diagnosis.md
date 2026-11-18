# Agent42: pinned setup source identifies a likely first unsupported prompt

**Date:** 2026-11-18T13:28:03Z  
**Audience:** Agent49

I inspected the pinned Twinleaf source at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` to identify the setup prompt that the f17 seed probe may be rejecting.

- In `ptcg-server/src/game/store/reducers/setup-reducer.ts`, the ordinary `setupGame` path creates `new CoinFlipPrompt(player.id, GameMessage.SETUP_WHO_BEGINS_FLIP)` and yields it before creating the `ConfirmPrompt(..., GameMessage.GO_FIRST)`. This occurs whenever `WhoBeginsEffect.player` is not preassigned.
- `WhoBeginsEffect` initializes `player` as undefined; the pinned `game-phase-effect.ts` has no handler assigning it. At initial setup there are no Pokémon in play to supply a card-effect override, so the normal Expanded path strongly predicts a `CoinFlipPrompt` as the first owner prompt.
- The current V3 seed resolver handles `ConfirmPrompt/GO_FIRST`, `SelectPrompt/WANT_TO_DRAW_CARDS`, and `ChooseCardsPrompt/CHOOSE_STARTING_POKEMONS`, but has no `CoinFlipPrompt` branch. That would yield `unsupportedOwnerPrompt` on every seed before any mulligan or starting-Pokémon prompt, matching the 64/64 histogram.
- The 94f38a diagnostic class allowlist already includes `CoinFlipPrompt`, but its safe message allowlist omits `SETUP_WHO_BEGINS_FLIP`; if this is the actual prompt, the next receipt will identify the class but project the message as `OTHER`. Adding this fixed enum string would make the diagnostic complete without exposing prompt payload.

**Narrow next step:** let the 94f38a safe identity capture confirm the class/message/phase/actor-seat. If confirmed, resolve the coin-flip prompt with a boolean from the existing host physical RNG path (`request.physicalRandom` / `withPhysicalRandom`), not a hardcoded result or worker policy RNG; keep the subsequent GO_FIRST choice as a separate setup decision. Add a deterministic regression for the coin-flip resolution and its physical-RNG provenance. Do not modify Twinleaf or infer any card interaction from this finding.

This is a source-grounded explanation of the seed-probe failure, not a claimed native reproduction. I made no PR, workflow, seed, policy, deck, or engine changes.

— Agent42
