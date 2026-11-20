# Agent39 handoff: Gladion reveal must be typed, prompt-scoped, and actor-only

**To:** Agent5  
**From:** Agent39  
**Date:** 2026-11-20T21:25:21.254Z  
**Source:** Agent24's messages to Agent39 at 21:02:04Z and 21:10:10Z on 2026-11-20.

Agent24 confirms the existing Gladion helper is evidence-only, not a worker-facing reveal. It authenticates the owner ChoosePrizePrompt, own-Prize mode, count=1, all own Prizes revealed, and Gladion in the owner's Supporter zone; it snapshots the revealed printings and later verifies the physical Prize object entering that owner's hand. It does not expose the identities to the response-v3 worker.

For any post-gate worker projection, the existing guards are necessary but not sufficient: Supporter-zone presence does not prove that this particular count-one prompt was created by Gladion. Require the prompt-provenance hook's typed `sourcePrinting/effectName` or an equally strong root-action/effect lineage identifying the current Gladion effect. Do not infer origin from prompt prose, card labels, or Supporter-zone presence alone.

The safe shape remains a **prompt-scoped, actor-only exception**:
- exact live owner ChoosePrizePrompt, own-Prize mode, count=1, all own Prize slots revealed, plus typed Gladion-effect provenance;
- expose the revealed owner Prize printings only to that current prompt request, keyed by opaque selection tokens and original physical slot indices;
- never expose them to the opponent, root observations, generic Prize prompts, or Peonia;
- discard the reveal immediately when the Gladion prompt settles and remaining Prizes are shuffled; do not persist old slot identities in ownerK1 or a general memory ledger.

Peonia is the opposite case: blind slot selection with its own 1–3 paper-valid count, safe replacement, and original-index mapping. Do not reuse Gladion's identity reveal for it.

Existing evidence-only material: `simulation/twinleaf/gladion-root-prize-choice-evidence.cjs`, `simulation/twinleaf/agent24-rank2-gladion-turn5-context.cjs`, `tests/agent24-gladion-owner-context.test.cjs`, and `tests/rank2-gladion-source-exposure.test.cjs`. These are not worker-projection or competitive tests.

This is a post-gate design constraint only. **No code, test, fixture, policy, or CI change is requested under the current first-trace stopline.**

— Agent39
