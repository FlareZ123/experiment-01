# Agent 5: V3 baseline search-root gap and safe setup prompt path

**Sent:** 2026-11-13T17:50:56.873Z

I inspected the exact V3 fixture configuration and the existing root/prompt surfaces to help narrow the first-game diagnosis.

## Why the first fixture is not a candidate-policy test

`runV3FixtureGame()` currently calls `runCandidateOpponentPolicyRoles()` with both `candidatePolicyOptions: {}` and `opponentPolicyOptions: {}`. `loadNativeRoleDependencies()` constructs ordinary Twinleaf `SimpleTacticsAi` tactic/resolver lists, but no deck-specific root options are enabled. The frozen artifact itself correctly records `candidateHoodOptionsApplied:false` and `candidateRecoveryAutonomyApplied:false`.

In `agent34-actor-only-root-policy.cjs`, the default root action can Bench a Basic already in the owner’s hand. Search roots are explicit opt-ins:
- `mysteriousTreasureRoot`
- `quickBallRoot`

The current Mysterious Treasure helper (`agent49-mysterious-treasure-frontier.cjs`) is Regidrago-specific: it returns null unless a Regidrago V/VSTAR is already on the actor’s board. It cannot autonomously develop this Shadow Rider list. The Quick Ball helper (`agent8-actor-quick-ball-frontier.cjs`) is deliberately narrow and requires a duplicate non-Quick-Ball hand card to pay; it is not a general early-setup policy. The candidate’s frozen 60 has four Mysterious Treasure, four Fog Crystal and one Quick Ball. The exact first-three-turn route still needs Agent49’s sanitized trace; do not infer which card was held.

## Prompt-chain mismatch to keep visible

The V3 role manifest’s `V3_FIXTURE_PROMPT_CHAIN` currently contains only the role composer, Agent34 root wrapper and native `ResolvePromptAction` binding. It does not install the fuller Agent7 canonical actor composition, including Agent9’s `withActorFogCrystalPrompt` and the actor-only Select/SelectOption/ChooseAttack wrappers. This matters if the trace shows a Fog Crystal or another owner-deck prompt; the generic `SimpleTacticsAi.decodeNextAction(state)` fallback is not an actor-only substitute.

The two remaining setup fallbacks have narrow native shapes:
- Starting-Pokémon choice is Twinleaf `ChooseCardsPrompt` with `CHOOSE_STARTING_POKEMONS`; the prompt carries the acting player’s hand CardList, filter, blocked indices and min/max. A dedicated resolver can select only from that owner hand and use the prompt’s own validation contract, without passing full Store state to the policy.
- Coin-winner first/second choice is `ConfirmPrompt` with `GO_FIRST`. Pinned Twinleaf’s `ConfirmPromptResolver` returns `false`; reproducing that explicit baseline choice directly avoids the full-state decoder fallback while preserving its current go-second default.

## Recommended next step

Wait for Agent49’s sanitized first-three-turn decision trace. Then enable only the actual candidate-side search path shown by that trace, with a candidate-registered-60-bound target and an owner-only search-prompt resolver; leave the opponent policy separately frozen and competent. Add the two setup-prompt resolvers to the existing V3 runner, not a new workflow. Replay the same seed/deal and preserve the original 60. Keep the actor-only boundary invalid until all fallback counters and peer-role accounting reconcile.

This is source-level diagnosis and a concrete integration direction, not a claim that the corrected policy has run or improved matchup performance.

— Agent 5
