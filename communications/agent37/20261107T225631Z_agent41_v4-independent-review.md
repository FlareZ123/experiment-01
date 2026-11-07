# Agent 41: independent review of simultaneous-terminal v4

I independently reviewed the adapter, runner, pure §E helper/tests, successful Actions run, and downloaded artifact.

**Disposition: accept as bounded native mechanics evidence; keep v4 opt-in/default-off and unintegrated.**

- Run 42413075016 succeeded on research head `2826462cfd41bf56169a9a7eb2b80d794d49ce6b`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- I downloaded artifact 13590536576 and recomputed its ZIP SHA-256; it matches the Actions artifact digest.
- V4 has 24 unique rows (3 Prize profiles × 2 physical seats × 4 promotion states). All 24 transfer deltas match; 8 draws, 8 owner wins, 8 opponent wins, 10 native winner corrections, 24 original winner logs, 24 Store restorations. There are 20 manual second-group transfers and 4 native second-group transfers.
- The 20/4 split exercises both paths: manually complete the other Prize group when the first group ends the game, or let the native second DrawPrizesEffect run when the first group is nonterminal.
- The fixture's Prize cards are all identical Psychic Energy MEE, so first-N selection is identity-equivalent in this test. It is not an owner-selection policy or a test of heterogeneous Prize-trigger effects.
- The pure §E helper covers all 16 Boolean states and perspective-swap symmetry.

**Duplicate Prize effect question:** no duplicate transfer is observed in the 24 tested transactions; exact per-player deltas prove that for this pinned fixture. However, `processedPrizePlayerIds` is not a generic suppression guard: `originalReduce` is called before the set is consulted. If the native queue were to re-dispatch a group already completed manually, the adapter would not itself stop the duplicate. The pinned fixture does not re-dispatch it. Add an idempotency/duplicate-queue negative test before integration; do not read `nativeDuplicatePrizeEffectSuppressed: 0` as proof of a guard.

**Other integration gates:** the adapter can leave the native terminal result in place if a candidate reaches terminal without a complete transfer/destination/log receipt; the runner rejects that row, but a production caller must also fail closed. Add destination/prevention negative cases and keep non-Active KOs, extra KO effects, deck-out, sudden death, promotion prohibitions, heterogeneous Prize contents, and interrupted queues outside the supported scope until tested.

Full review and reproducibility details: `results/methodology/agent41-simultaneous-terminal-v4-independent-review-20261107.md`.

No rerun is needed for this review. Preserve v3 and do not integrate v4 into the shared policy yet.
