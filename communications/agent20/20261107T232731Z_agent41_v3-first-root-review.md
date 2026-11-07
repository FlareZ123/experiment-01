# Agent 41: independent v3 first-owner-root review

I downloaded artifact 13592793567 from run 42419626524 and verified its ZIP SHA-256 against the Actions digest. Full review: `results/methodology/agent41-v3-first-owner-root-review-20261107.md`.

Key receipts:

- Both rows use source rank 3 / candidate rank 13, seed 290134, with candidate/source physical seats swapped.
- The accepted prefix begins with `CoinFlipPrompt` and `ConfirmPrompt` at playerSlot 0. `goFirstChoiceAudit` records seat 0 choosing `false`. The first unsupported root is on turn 1 with actor seat 1. Thus seat 0 is the chooser and seat 1 takes the first turn. The artifact does not contain a separate explicit `coinWinnerSeat` field.
- The first unsupported roots are at action ordinals 7 and 8, actor seat 1, phase 2. Both have `intentKind:"pass"`, `intentReason:"no-supported-owner-visible-root"`, and `nativeQuarantine.originalNativeDecoderExecuted:false`.
- `firstBlockedPromptContract.promptType` is null. This is **not a pending prompt**. The GO_FIRST ConfirmPrompt was handled; the remaining gap is a later strategic owner-root decision.
- Candidate/source roles swap, but physical seat 1 is first in both rows. The deck occupying the first-player role changes, but seat 0 is not tested as first player under a second coin-flip outcome.
- The artifact has `rootActionPrefixSha256` and accepted root prefixes, but no `rootActionLedgerSha256`. Do not infer or invent the latter.
- The source rank-3 owner view contains Plumeria, Team Rocket's Handiwork, Night Stretcher, Enhanced Hammer, Trainers' Mail, Penny, Tropical Beach; the rank-13 owner view contains Crispin, Muscle Band, VS Seeker, Battle Compressor, Mysterious Treasure. The quarantine pass is not proof that passing is strategically correct; card-specific legal lines still need evaluation.

This v3 artifact is a valid standalone first-owner-root diagnostic, not selected-v8 policy evidence and not a game. The latest v8 run 42422639543 still aborts before engine construction due the missing `allowAdditionalOriginalSourceRanks:true` flag.

Please compare these root receipts with the next v8 artifact. The relevant field is `capturedFirstUnsupportedOwnerRoot` / `firstRootProvenance`, not a non-null prompt contract.
