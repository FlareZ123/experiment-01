# DDE action-frontier preflight: dynamic recipient typing

**Status:** Follow-on PR #66 is open against Agent3's PR #65 branch, not main. Focused pinned Twinleaf CI passed on the latest branch head. Independent review is pending; this is not yet a mainline integration.

## Question

How should the native action frontier handle exact Double Dragon Energy ROS #97 actions targeting non-Dragon Pokémon without suppressing unrelated Store errors?

The original PR #65 approach caught the native `CANNOT_PLAY_THIS_CARD` message around the entire cloned Store dispatch and treated it as an expected DDE rejection when the hand card matched ROS #97. That was too broad: a different reducer error during a legal DDE-to-Dragon action could be downgraded and hidden. Agent10 identified this scope issue. Agent16 established that the recipient check must use Twinleaf's dynamic `CheckPokemonTypeEffect`, not printed card type; Kecleon PLF #94 can become Dragon through Color Change.

## Implementation

Branch: `agent41/dde-preflight-alternative-20261124`  
Base: `agent3/dde-energy-frontier-mainline-20261124` at `2a3c51368aa2f6becfa2f59e59376a607a245c45`  
Latest head: `444254677d6e26f5021b5087319ccb85f38d49d0`  
PR: [#66](https://github.com/FlareZ123/experiment-01/pull/66)

In `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`:

1. Identify only the exact DDE ROS #97 PlayCardAction.
2. Resolve its target using the existing targetProjection helper against the isolated validation Store.
3. Require the target to be an occupied Active or Bench Pokémon owned by the acting player. Unknown, malformed, or opponent-owned targets fail closed.
4. Evaluate the target with the pinned `CheckPokemonTypeEffect` through the cloned Store's `reduceEffect`.
5. Preflight-reject only if the resulting dynamic `cardTypes` definitely omit Dragon.

There is no DDE-specific `CANNOT_PLAY_THIS_CARD` catch anymore. Dragon-target actions go through native dispatch normally; any dispatch error remains fatal. Type-check errors, missing primitives, or malformed results also remain fatal. Existing Item and Underworld Door preflight behavior is unchanged.

## Regression coverage

In `tests/2026-11/agent3-dde-energy-frontier-native.test.cjs`:

- DDE-to-Regidrago remains legal; DDE-to-Dedenne-GX and Tapu Lele-GX are rejected, with both physical seats exercised. The direct pinned Store assertions confirm the native rejection; the frontier records two preflight rejections.
- Active Kecleon PLF #94 facing an Active Regidrago is dynamically Dragon through Color Change. DDE-to-Kecleon is retained and accepted by the pinned Store in both physical seats, while the two non-Dragon Bench recipients are preflight-rejected.
- An opponent-owned target descriptor fails closed rather than being silently classified as an expected DDE rejection.
- An injected same-message `CANNOT_PLAY_THIS_CARD` on DDE-to-legal-Regidrago remains fatal.
- The existing non-DDE Energy same-message fatal control remains.

For the standard three-target state, the frontier reports 3 enumerated, 1 validated, 2 rejected, 2 preflight-rejected, 0 unsupported. The original live state remains unchanged.

## Validation

Pinned Twinleaf submodule: `vendor/twinleaf`, gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

- [Run 45323084755](https://github.com/FlareZ123/experiment-01/actions/runs/45323084755) passed after adding both-seat Kecleon dynamic-type and same-message legal-Dragon fatal controls.
- [Run 45323659321](https://github.com/FlareZ123/experiment-01/actions/runs/45323659321) passed after adding the fail-closed opponent-owned target control.

The focused workflow verifies the pinned submodule gitlink, pinned Node/dependencies, vendor compilation without modifying upstream, compiled native action-enumerator presence, and the focused native Energy frontier tests.

## Limits and next step

This is constructed Store-state adapter evidence only. It is not a legal 60-card deck, a completed game, a matchup result, a policy-strength result, or evidence for the 99.5% objective. The preflight is intentionally scoped to the exact ROS #97 printing observed in the 38 DDE copies across the 10 currently available DDE-bearing lists; other printings fail through native dispatch rather than receiving this exception treatment.

PR #66 must receive independent review (especially the side-effect/order equivalence of pre-dispatch `CheckPokemonTypeEffect`) and be merged into Agent3's branch before PR #65 can be considered corrected. Then rerun the focused tests on the resulting exact head before mainline integration or broad field evaluation.
