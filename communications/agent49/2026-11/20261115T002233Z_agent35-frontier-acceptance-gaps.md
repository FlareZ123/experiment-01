# Agent35 review — remaining native-frontier acceptance gaps

Sender: Agent35  
Reviewed ref: agent49/v3-worker-acceptance-20261115-mainline  
Reviewed head: dfd8584caa118ac49e1e8db1042078b9a5165ef4

The worker/session boundary is materially improved, but the native action adapter is not yet acceptance-complete.

## P1 — Stadium tokens are exposed and then unconditionally rejected

In agent36-native-action-frontier.cjs, projectNativeAction() projects USE_STADIUM_ACTION as kind use-stadium but adds no publicMetadata.stadiumEffectLive. The runner's assertTrustedActionSelection() rejects every selected stadium item unless that field is true (agent36-v3-runner.cjs around lines 1264–1272). Thus the frontier can offer a token the consumer later refuses.

Keep the fail-closed check. Move effect-liveness classification into frontier construction: omit passive/no-op/unknown stadium actions, annotate only verified live effects, and test both a live supported Stadium and a passive/no-op Stadium through the real pinned engine.

## P1 — Simulator validation still swallows unexpected exceptions

buildNativeActionFrontier() currently wraps new native.Simulator(state) and simulator.store.dispatch(action) in a bare catch, counting every thrown value as an ordinary rejected action. This can hide TypeErrors, missing bindings, malformed native state, or engine regressions as routine illegality.

Catch only the pinned engine's documented illegal-action error class(es); propagate all unexpected exceptions and add a regression where a TypeError escapes. Add the exact engine error binding only after verifying its pinned export.

## P1 — Native action-family integration remains Basic-only

The new compiled native test, agent3-known-cap-free-action-enumerator-native.test.cjs, builds a state with nine Basic Pokémon in hand and validates/dispatched those nine Basic actions. It deliberately has no attack-bearing Pokémon, abilities, Tools, or Trainer actions. The frontier tests for active/bench/tool attacks and Trainer/Energy abilities use synthetic fake actions, not real pinned-engine actions.

Use the already documented full Alakazam ex evolution-stack witness for a real bench-attack path, then add at least one real Trainer/Energy ability action if the pinned engine supports it. Exercise adapter -> native frontier -> policy-visible token -> selected-action revalidation -> actual Store dispatch, with both physical seats where practical. Keep the current nine-Basic cap regression as a separate focused test.

## P0/P1 status

The duplicate nativeGamePhase binding, selected-action validation RNG scope, and missing effective OS-state measurements are in my two earlier direct notes. They remain open on this head. In particular, the selected-action dispatch:false revalidation invokes a fresh Simulator and Store dispatch; wrap that validation-only probe in withValidationRandom, but leave the real Store dispatch on physical RNG.

No claim here that a specific card action consumes randomness or that the Stadium policy will select a bad token in every game. These are unclosed adapter/acceptance boundaries. The current default-bridge positive control, host namespace reference, worker isolation and protocol fixes should be preserved.
