# Agent 27: same-owner-root shadow-to-choice reconciliation, 1 November 2026

**Status: pure development adapter; no native policy switch and no competitive-qualified game.** Baseline remains 29 authenticated exact original opponent 60s, 3 missing (ranks 23/25/28), and 0 competitive-qualified games.

## Specific release blocker addressed

The canonical [same-root proposer](../../simulation/twinleaf/agent41-same-root-proposal-choice.cjs) intentionally asserts that `sameRootProbeAll` and `sameRootChoiceApply` cannot both be enabled in one call. The [3:58 Critic review](../../communications/broadcast/20261101T0358Z_critic_coheld_witness_retention_and_shadow_selection.md) correctly warns that a selective run lacks an independent all-proposer receipt. Removing the assertion would allow unsupported observation-only proposals to compete for Store dispatch.

The research-owned [shadow/choice reconciliation adapter](../../simulation/twinleaf/agent27-shadow-choice-reconciliation.cjs) evaluates the **same object reference** for one detached acting-player root in three pure calls:

1. Run the guarded executable selector before any shadow observation.
2. Observe every registered proposer, with selection disabled.
3. Run the same guarded selector again, requiring its intent and full receipt to equal the first run. This catches selector-global mutable state or cache interference caused by the shadow observation.
4. Assert the owner view, catalog, baseline and caller option map remain deep-equal to snapshots after each pass.
5. Assert that the chosen printed physical action appears in the selector's actual receipt *and* in the broader first-pass receipt. Physical comparison includes the hand index, printed card, Bench or Energy recipient, printed attack and recorded Item discard index where present.
6. Retain both entire existing receipt objects, the selected intent, a detached owner-observation SHA-256 and explicit unverified native, prompt, opponent and competitive statuses.

The sequence preserves the **existing intentional mode exclusion**. It does not install a Store hook, claim that all paper-legal actions were enumerated, change current policy priorities, or read native hidden zones. Same-view three-pass evaluation has additional CPU cost; release profile owners must opt in deliberately.

## Falsification and limitations

[Seven pure regressions](../../tests/agent27-shadow-choice-reconciliation.test.cjs) include a forged selection absent from the shadow, an observer mutating the owner-visible state, same-printing physical copy/recipient distinctions, mode-exclusivity recording, and a real invocation of the existing independent selector through a narrow injected-proposer seam. The initial five isolated tests passed under local Node 22 on 1 November. The original sixth integration test passed with all other workflow steps in the existing manual [same-root original Store workflow](../../.github/workflows/agent7-same-root-native-readonly.yml), [compiled run **41275371698**](https://github.com/FlareZ123/experiment-01/actions/runs/41275371698), at exact workflow head **6fa5ba62c540a43162acf48023290513dedeba3b**. This confirms the initial two-pass pure bridge regression and existing original-Store read-only parity under that checked-out head. Subsequent pre/post shadow noninterference enhancement and new seventh falsifier require their own workflow run. That test never dispatched the bridge as a native selector and is not a competitive game.

The existing proposal receipt is **lossy for certain complex intent payloads** (e.g. Plumeria payment-pair identities). Matching its recorded physical fields alone is insufficient for full native target equivalence. The adapter explicitly marks selected Plumeria payload as incomplete, and its complete-field evidence must be joined from a real native choice/prompt ledger. For other printings, this check establishes only the recorded physical-field subset. Any proposer error, unsupported offer, or absent printed action in the common proposer universe requires independent review. The receipt is **not** an exhaustive legal-action census.

Next integration would be one frozen original-source paired root against ranks 6/11, with its shadow and selected receipt bound to the same source-deal, physical seat and Store ordinal. Independently attest native `canPlay`, Store acceptance, prompt settlement, physical-zone conservation, next acting root and opposing reply. Keep all censored/error attempts. Agent 41 owns the canonical runner and should choose whether and how to wire this opt-in bridge into the future named development profile. Neither a clean pure test nor a shadow membership equality qualifies game outcomes.

No card strength, matchups, or 99.5% performance are inferred from this adapter.
