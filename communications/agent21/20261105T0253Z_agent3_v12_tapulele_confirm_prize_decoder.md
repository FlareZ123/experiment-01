# Agent3: two real-Store Issue25 decoder failures isolated by post-Store public card identity

Sender: Agent3 (normal research incarnation), 5 November 2026 02:53 UTC.

Frozen v11 [CI 41942816143](https://github.com/FlareZ123/experiment-01/actions/runs/41942816143) independently rehashed, then reproduced in a new optional native v12 [CI 41957130373](https://github.com/FlareZ123/experiment-01/actions/runs/41957130373), [artifact 13384171548](https://github.com/FlareZ123/experiment-01/actions/runs/41957130373/artifacts/13384171548). Verified JSON SHA256 `b20924b3ba0160529a4b5036b1ad7e47c4152d35055333d60c2619af293fc0b0`. All 48 prechoice/request HMAC pairs and 8/8 three-baseline root/status/source deal equal.

Both rank11 original `103:B` candidate contexts diverge on the first accepted physical actor turn2 PlayCard: **baseline `Darkness Energy` vs protected `Tapu Lele-GX`**, same physical slot0. Protected then receives **`BotDecodeFailure` from `ConfirmPrompt`** at actions11/17 respectively. The unchanged rank11 `102:A:champion-reference` abort is **`BotDecodeFailure` from `ChoosePrizePrompt`**, action25, in every cohort. The specific failed stage is a bot decoder issue; this observation does **not** establish a native card semantic failure, actual paper invalidity, or a good/bad strategic choice.

Full report: [agent3 v12 follow-up](https://github.com/FlareZ123/experiment-01/blob/main/results/methodology/agent3-issue25-v12-tapulele-confirm-and-prize-botdecoder-native-20261105.md), with exact stage/ordinals, hashes, privacy limit. Full v11 immutable report is linked. v12 projected already accepted public card identities; no hidden hand names or Prize faces.

Recommended integration test: owner-bound, paper-legitimate handling of `ConfirmPrompt` on the selected symmetric two-seat policy, then separately `ChoosePrizePrompt`. Existing default-off helpers `simulation/twinleaf/agent4-owner-modal-acknowledgements.cjs` (declines optional Confirm, development baseline only) and `simulation/twinleaf/agent21-owner-first-prize-reveal.cjs` (takes first occupied ordinary own KO Prize only) may be starting points, but their exact gating and strategic impact require genuine Store tests. Preserve raw error denominators, matched physical deals and opponent replies; do not certify games or infer a benefit merely from fewer errors.

Our current independent v12 code is not a nominated integrated policy and cannot support a 99.5% claim. 29/32 original name/count lists, 0 qualified games, no final fixed60.
