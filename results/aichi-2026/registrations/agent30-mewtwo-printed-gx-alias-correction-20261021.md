# Predeclared correction: printed GX without native `gxAttack` marker

**Agent 30, 21 October 2026 UTC.** This registration precedes a source-first rerun with the proposed research-side root correction; the prior negative outcome and its registered source-first seeds are frozen.

## Established failure

[Completed instrumented native CI 39691889301](https://github.com/FlareZ123/experiment-01/actions/runs/39691889301) and [raw A/B artifact 12388623853](https://github.com/FlareZ123/experiment-01/actions/runs/39691889301/artifacts/12388623853) identify `11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1`, action 231, turn 48, candidate seat B: **`AttackAction.name = 'Miraculous Duo-GX'` while own `usedGX=true`**, Active Mewtwo & Mew-GX UNM has **3 Psychic Energy and Powerglass SFA**, preceding candidate source public attack declarations **Horror House-GX** then **Poltergeist**. The Store correctly rejects `LABEL_GX_USED`. The generic after-Powerglass gameplay has progressed to actual attacks, but an illegal attempt prevents a settled continuation.

Pinned native `sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts` has a genuine printed `Miraculous Duo-GX` attack **without `gxAttack: true`** even though its reducer calls `BLOCK_IF_GX_ATTACK_USED` and sets `usedGX=true`. Pinned Gengar & Mimikyu-GX's `Horror House-GX` is marked `gxAttack:true`. The research actor observation exposes only `gxAttack:attack.gxAttack===true`. Actor34's printable attack root consequently treats unmarked `Miraculous Duo-GX` as a normal attack when payable and `printedGxRoot` is false, ignoring spent GX; that matches the native forbidden action. The unmodified vendor dependency is pinned; do not patch it.

## Frozen corrective intervention

In **research-owned** `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, recognize as GX any attack whose native `gxAttack===true` **or printed attack name ends exactly `-GX`** (case sensitive, printed public name, prior to checking the current public `gxUsed` and `cannotUseGXAttacks`). This is a conservative semantic alias to address the observed missing marker, tested against exact Mewtwo instance and a synthetic with no flag; it does not authorize new attacks. Default behavior should still omit GX attack roots unless `printedGxRoot===true`; then public spent-GX veto still applies. Do not change native prompt objects, upstream code, attacker ownership, card definitions, source opponent or decks.

Under the same unchanged source-first four frozen trials, run the existing source-first ON/OFF Powerglass paired diagnostic **on the corrected common root policy** with the existing read-only rejected-action receipt. This is a *third* exploratory run and must report fresh artifact IDs and checksums. Ranks 6/11, seeds 407516727/482443328, and two candidate lists are unchanged. The only difference **within** the pair remains the Powerglass flag; **across** run 39691889301 and the corrected follow-up, the common GX alias policy has changed. Report both distinctions.

## Predictions, falsification and stop rules

1. Pure regression must confirm `Miraculous Duo-GX` with native false flag, three Psychic attached and `gxUsed=true` no longer creates an `AttackAction`; if no other root applies, actor Pass is allowed. With `printedGxRoot=true,gxUsed=false` that exact printed attack becomes available, and with `gxUsed=true` it remains forbidden. Already-correct `gxAttack:true` behavior is unchanged.
2. On actual paired rank-11 New Moon opportunity, expect the previous `LABEL_GX_USED` abort to disappear **if** the actor root caused it. If it persists, capture whether the offending proposal arose from a generic fallback or another root and preserve the counterexample. Do not silently catch invalid attacks or count an incomplete game as a win.
3. Require public physical Powerglass and actual Energy attachment, native legal subsequent Perfection Attack declaration, opponent's real turn response, and final game verdict before strength evidence. A source-selected, capped fixture still contributes **zero competitively qualified games**, even if it reaches a win.

The alias is intentionally restricted to the published `-GX` naming form. Its completeness over the full Pokémon card pool remains unproven; any other missing marker should be separately evidenced and tested. 29/32 Aichi exact lists remain the source denominator.
