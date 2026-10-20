# First genuine G&H mode: identical source roots, native null-to-zero causal fork

**Agent 24; 20 October 2026. Evidence class: real-source native Store same-state intervention.** Successful [manual compiled CI 39384518007](https://github.com/FlareZ123/experiment-01/actions/runs/39384518007), pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, research HEAD `c2a6d24f7d4ad0021d7469c2acf807800a0958f1`. Original [JSON archive 12246629563](https://github.com/FlareZ123/experiment-01/actions/runs/39384518007/artifacts/12246629563), artifact-reported digest `sha256:931b4f568108d37d589b78c1221b859e336864bd482591cff36e9ba2c190fb8c`.

## Isolated hypothesis

The previous real source [both-seat comparison](agent24-rank2-real-source-mandatory-option-exposure-20261020.md) found six genuine G&H null modes and five corrected mode-zero replies but used different *whole-match* bot policies. The corrected prompt resolver also changes **speculative Supporter action scores before the card is committed**, so those earlier trajectories began diverging even before the first G&H play. To isolate the native card-effect choice itself, the current experiment preserves the entire default speculative bot until the first genuine source-owned pending noncancelable G&H SelectOptionPrompt.

[Native hook](../../simulation/twinleaf/agent24-live-source-gh-modal-fork.cjs) wraps `SimpleTacticsAi.prototype.decodeNextAction` only during one synchronous real headless match, lets the unmodified bot select the root action, and replaces its very first genuine source-owned null `ResolvePromptAction` with an index-0 `ResolvePromptAction`. It requires an unresolved native modal belonging to the actual source player, `allowCancel:false`, and a choice string containing Stadium. It changes no earlier action proposals and does not alter vendor files. The prototype is restored on both success and throw; [compiled unit controls](../../tests/agent24-live-source-gh-modal-fork.test.cjs) checked first-only alteration, other-seat/cancelable no-ops and cleanup.

## Two strict pre-choice matches

Both trials use the original published rank2 Vileplume 60 against the original published champion rank1 Shadow Rider 60. Config: strict prompt validation, reversible Supporter-proposal guard, isolated per-seat policy RNG, genuine decision/root-action traces, 260-root cap. With each source in physical seat A and B, the two arms of each sample have identical source deck hashes, actual first-turn attribution verified by engine draw log, and **identical root-action ledgers through all actions strictly before the first modal resolution**. Pre-prompt matching is computed by SHA-256 of those actual ledger prefixes and asserted in the returned `strictMatchedNativeFork` field.

| Rank2 source physical seat, seed | Original first source G&H | Same pre-choice intervention | Prefix equality | Later engine-only status |
| --- | --- | --- | --- | --- |
| A; `20261021` | global turn **4**, Play root **30**, next real modal root **31**, chosen **null** | Same turn/roots, chosen **0** | **Yes** | original censored at 260 roots; corrected engine terminal at 241 roots |
| B; `20261023` | global turn **7**, Play root **81**, next real modal root **82**, chosen **null** | Same turn/roots, chosen **0** | **Yes** | original engine terminal at 260 roots; corrected censored at 260 roots |

**All 2/2 native paired comparisons passed** `strictMatchedNativeFork:true`, with no engine errors. Both source-owned prompts offered the actual pinned effect strings: `Search for a Stadium card from your deck` (default option 0) and `Discard 2 cards from your hand. Search for a Pokemon Tool and Special Energy from your deck` (option 1). The original choice was `null` even with `strictPromptValidation:true`. The intervention accepted mode zero on that same real native root.

This is stronger than simply checking that a hypothetical patched bot picks a different action. The first actual input decision and entire prior game action history remain fixed. Divergence after the changed mandatory prompt is a genuine intervention consequence **within the pinned engine**, subject to that engine's known card-implementation gaps. The result also shows why blindly comparing eventual engine terminals is invalid: one arm may hit a cap and the other may terminate, with unreliable later decision policies and no physical game clock.

## Consequences and limits

- The reproducible defect affects true published rank2 games on **both** physical seats, and an isolated prompt correction is accepted at the first native source decision with an identical observed pre-prompt action history.
- The opt-in [global both-seat fallback](agent24-headless-mandatory-option-bridge-20261020.md) can avoid the null, but it still defaults to mode **0** rather than implementing rank2's relevant **mode 1** ALS search. Neither correction certifies strategic choice quality, competent replies, paper Expanded completeness, opponent information safety or match clock.
- The existing `strictPromptValidation` checks `prompt.validate()`; this inherited native SelectOptionPrompt accepts null despite `allowCancel:false`. Any future true fail-closed validator must be separately versioned and audited. Earlier CI test labels by themselves cannot certify mandatory-option legality.
- Neither the 2/2 matched source root checks nor changed engine terminals are actual game-win samples. Benchmark still **29/32 exact opposing lists** and **0 competitive-qualified games**.

The integration owner was separately notified of the underlying six-turn exposure. This matched-state result should determine the gate before adopting a new source-and-candidate common policy in the full 32-rank research program.
