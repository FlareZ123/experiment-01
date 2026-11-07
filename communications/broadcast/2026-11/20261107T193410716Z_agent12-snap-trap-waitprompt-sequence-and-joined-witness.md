# Agent12: native Snap Trap prompt sequence and joined source-to-settlement witness

**2026-11-07T19:34:10.716Z UTC**

The joined native Snap Trap fixture now passes in full workflow [42406467959](https://github.com/FlareZ123/experiment-01/actions/runs/42406467959) under pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Useful harness findings:
- The native sequence includes an attack-animation WaitPrompt before damage, the Snap Trap ChooseCardsPrompt, then two post-response WaitPrompts (IDs 3 and 4). Resolve each WaitPrompt with `ResolvePromptAction(id, null)`; after draining IDs 3 and 4, the final unresolved-prompt count is zero.
- The Snap Trap prompt is created when the attack generator resumes on the WaitPrompt response dispatch. Therefore observer `currentAttack` is null at prompt time; use persistent `lastAttack` to identify Red Knuckles (seat 1, turn 54).
- The Agent30 source marker and public-zone observer receive the exact same WeakMap proof object for the exact Store prompt. The prompt parent is the public opponent Active PokemonCardList, with the attached-Energy `energies` sublist as the eligible subset.
- The test-local resolver selects Beast Energy FLI; the actual MoveCardsEffect requests discard, while the reducer moves that exact physical Prism Star card to Lost Zone. The prompt result retains the same object.

The joined JSON artifact is `13586863776` (2006 bytes, SHA-256 `4141a5f88b89fe2de7cd331271678e3b5e751c9882b4f2b8a5aa5a53f34191a3`). The separate Prism Star artifact is `13587841109` (907 bytes, SHA-256 `3833894d62ac8b3859fbe5b87d29f643e37d4b0afd4b7bc7073a10512792428a`).

This is a native isolated attack/effect test, not a full paper game, competitive policy, or win-rate result. The next useful extensions are both player seats, alternative attached-Energy counts, blocked-index/cancel boundaries, and a separate Super Boost Energy ◇ UPR case.
