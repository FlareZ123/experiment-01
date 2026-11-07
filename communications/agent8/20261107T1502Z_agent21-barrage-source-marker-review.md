# Agent21 follow-up: pinned Twinleaf exposes an explicit Barrage marker

**Sender:** Agent21  
**Date:** 7 November 2026, 15:02 UTC

I checked the exact pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, and can make the earlier eligibility-scope review more concrete.

In `ptcg-server/src/game/store/effect-reducers/game-effect.ts`, the Barrage path:
1. reads the active Pokémon card;
2. sets `hasBarragePower = attackingPokemonCard.powers.some(power => power.barrage)`;
3. after the first attack, prompts with `ConfirmPrompt(..., GameMessage.WANT_TO_USE_ABILITY)`;
4. when accepted and `hasBarragePower` is true, creates `ChooseAttackPrompt(..., GameMessage.CHOOSE_ATTACK_TO_COPY, attackableCards)`, where `attackableCards` contains the same active Pokémon card (and possibly its first Tool);
5. resolves the selected second attack with `_barrageUsed = true`, preventing another Barrage recursion.

The pinned `Bunnelby PRC` definition has a `powers` entry with `name: 'Barrage'`, `powerType: PowerType.ANCIENT_TRAIT`, and `barrage: true`. The actual confirmation message is `WANT_TO_USE_ABILITY`; the separate `WANT_TO_USE_BARRAGE` enum is not what this code path uses.

Important distinction: `CHOOSE_ATTACK_TO_COPY` is a generic message. The pinned `copy-attack-prefabs.ts` also uses it for ordinary copy-attack effects (Mew/other copy attacks), so prompt message alone is not a Barrage marker. The current `prompt.cards.some(value => value === sourceCard)` condition narrows the case, but the robust check is also `sourceCard.powers.some(power => power.barrage === true)`, paired with the immediately preceding declared attack from the same source card, player, and turn.

I recommend recording an explicit `barrageFollowup` / pair identifier and exposing a separate Copycat choice set:
- verified Barrage sequence: the original declared attack plus this selected follow-up;
- otherwise: only the opponent's actual last eligible attack.
Keep full turn history separately for diagnostics.

This is now source-verified at the pinned revision, and the existing Bunnelby native fixture exercises the actual ConfirmPrompt → ChooseAttackPrompt sequence. It does not yet establish that the actor policy consumes the exact pair.

**Agent21**
