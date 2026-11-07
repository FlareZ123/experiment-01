# Pinned native Store/bot identity guard for generic multi-Basic paid retreat

**Agent 2 | 7 November 2026 | evidence boundary: developmental native game.** This is a policy-provenance correction with a root-bound native canary on a previously selected original 60-vs-60 physical deal. It is no evidence of an improved win rate. Qualified competitive games: **zero**.

## Problem and fix

The earlier generic paid-retreat wrapper around SimpleTacticsAi.prototype.decodeNextAction considered qualifying PassTurnAction decisions without verifying that the caller was a registered root-game bot acting on the actual headless Store state. A speculative Store with similar state data could in principle be miscounted or modified. Agent6's headless callbacks onRootStoreCreated and onRootAgentsCreated now provide the exact live Store reference and its pair of native bot instances.

An **opt-in** isActualRoot(bot,state,seat) option in simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs requires rootStore.state === state and rootAgents[seat] === bot before a Pass can be upgraded. The new simulation/twinleaf/agent2-root-identity-guard.cjs composes existing callbacks and resets agent binding when the Store changes. The old wrapper is default-off with the historical behavior preserved. Seven pure tests exercise same-state foreign bots, detached states, absent and new registrations, both seats, observer callback composition and default-off behavior. Pure CI [42332416711](https://github.com/FlareZ123/experiment-01/actions/runs/42332416711) PASS.

## Compiled pinned native canary

[Manual CI 42332617694](https://github.com/FlareZ123/experiment-01/actions/runs/42332617694) PASS, pinned Twinleaf revision a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. Original rank3 Snorlax Stall is seat0 and original rank1 Shadow Rider is seat1, with unchanged exact physical source and opponent 60s, unchanged source seed 290134 and unchanged outer policy wrappers.

- Exact source 60 SHA256: 72c61d594eee5ee1d593b738af627c3ab8f3a38d1a5f29695ff39c8c09c2264f.
- Exact opponent 60 SHA256: de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311.
- Complete physical deal fingerprint: e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb.
- Original source-deal fingerprint: ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a.
- One root Store and one pair of two registered root bots, 26 exact-reference positive checks (seat0: 14; seat1: 12), **zero rejected native root checks** in the selected genuine game.
- One nominal generic owner paid retreat, at turn33, seat1, native RetreatAction ordinal155. The previous unguarded artifact independently witnessed three distinct Basic Psychic physically paid to retreat Dialga-GX UPR into Shadow Rider Calyrex V CRE on Bench slot1. The new identity check is not itself a physical Store payment acceptance observer.
- Native game outcome: rank3 winner, native terminal global turn59, 270 native actions, ledger SHA256 8eb6bacd09e83553fe5439f0a2ceada736f55e37acdba470a02bf9472a5027e2.

The historical [A/B/A treatment artifact 13418864781](https://github.com/FlareZ123/experiment-01/actions/runs/42038553414/artifacts/13418864781) and guarded [single-canary artifact 13557748401](https://github.com/FlareZ123/experiment-01/actions/runs/42332617694/artifacts/13557748401) were downloaded and independently compared. **All six fields were identical:** root ledger hash, actual native winner, terminal turn, native action count, full physical-deal hash and source-deal hash. Thus no native root-trajectory difference is observed here.

Reproduction: [implementation commit 2dbbb644](https://github.com/FlareZ123/experiment-01/commit/2dbbb644dc1494e946a0c547f740e0a7e4f8c73e); [canary and opt-in CI commit afc0cace](https://github.com/FlareZ123/experiment-01/commit/afc0cace5083d747febbfb880ac75e52b8db7b0e). New ZIP SHA256 dde8fac2949dacf43f57ce8c7ff79eda2eda220081392cc61b5f474156f2340b, inner JSON SHA256 9ca1ed8d5d0e58ad1ab393989a30c88a0b4fb69644a70fdc41183233988bc81c. Historical ZIP SHA256 a79f255028c4ed312f99712fb3290a9a1049d9ff4a2d08b4b0eedf94a9d6c38a, historical inner JSON SHA256 69caf042094f021c4ac4d8bcc9bb8c8c93a090aa7b3fbe690585f1dd286abbf2.

## Limits and next acceptance boundary

No speculative-root rejection occurred in the selected live canary; the rejection behavior is covered in pure synthetic tests. This is a single retrospectively chosen historical game with weak opponent policy and no completed official 25-minute match adjudication. The native terminal remains unqualified for any paper or competitive win-rate inference. The new guard protects against a specific reference-identity contamination class, without establishing paper validity of the action, alternative lines or a better 60-card candidate.

For a future preregistered bilateral-policy release, create a new guard for each game, pass guard.attach(request) into runMatch, pass isActualRoot:guard.isActualRoot into the paid-retreat decoder, and independently bind the selected action to post-dispatch Store acceptance and physical Energy/board transitions. Audit the opposing player's meaningful response and follow-on attack, full 32 original inventories, and official clock. Do not rewrite the earlier v8/v9 or historical selected deals.

**Collective objective status:** 29/32 authenticated original name-count 60s; no selected final fixed deck; zero qualified competitive games; 99.5% remains a target without demonstrated support.
