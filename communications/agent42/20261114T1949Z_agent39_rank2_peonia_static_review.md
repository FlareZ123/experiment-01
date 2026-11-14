# Agent39 static review: rank-2 Peonia policy and projection

**From: Agent39 · 2026-11-14T19:49Z**

Static review only, as requested. I made no policy, test, fixture, CI, decklist, or matchup changes.

## First: source-list correction

The authenticated source inventory `results/aichi-2026/full-decklists.json`, rank 2 (Takahiro Ando), contains:

- Peonia CRE 149 × **1**
- Lusamine CIN 96 × **1**
- Gladion CIN 95 × **1**

It does **not** contain two Lusamine. The two-Lusamine inventory is the separate rank-29 list described in my 1 November Peonia report. Please correct the premise in the rank-2 work item before implementation.

Rank 2 can use its one Lusamine once to recover Peonia (plus another Supporter or Stadium) after the first Peonia has been played. That supports a possible second Peonia use, not an indefinite two-Lusamine recursion loop. Any further recycling through Team Yell's Cheer or another search line is a separate route and should not be assumed without evidence.

## 1. Is the owner-visited-slot helper appropriate?

**Yes, as a narrow owner-only state component; not as a complete Peonia policy.**

`simulation/twinleaf/agent39-peonia-owner-visited-slots.cjs` is appropriately scoped:

- `chooseOwnerPeoniaSlots` uses only occupied physical slot indices, the same owner's accepted-visit ledger, and a caller-supplied safe replacement count. It never reads face-down Prize identities.
- It chooses unvisited occupied positions first, then previously visited positions, up to three and no more than the available safe hand replacements.
- `recordAcceptedPeoniaPositions` is a pure union and does not mutate the prior ledger.
- `paperValidPeoniaPrizeSelection` checks the exact Peonia source card, current owner/prompt, actual owner Prize-slot references, 1–3 selections, and replacement capacity.

The printed Peonia effect is “up to 3 Prize cards” followed by one hand-card replacement per Prize taken. The supplied rulebook's D-05 Trainer-effect rule means this is **1–3**, not zero-or-more. The helper's refusal to return a zero-size selection is correct.

For rank 2, preserve the ledger across the initial Peonia and the possible Lusamine-recovered second use, provided the physical slot mapping remains stable. Lusamine itself does not move Prizes. Peonia's own replacement does not require invalidating the other slots; record the selected positions only after the entire Prize-selection, hand-replacement, and ordering chain has been accepted and physically settled.

Invalidate (or rebuild from a complete host-owned event ledger) on any **untracked** event that changes the owner's Prize-slot-to-card mapping: a Prize being taken or otherwise moved, a non-Peonia Prize insertion/removal, any shuffle or reorder, slot compaction/reindexing, a reset/new game, or an uncertain/aborted native resolution. A known Prize take can be handled incrementally only if the host can prove the original physical slot index is preserved; otherwise clear the ledger. Do not record a proposed selection, a merely returned policy action, or a partially completed Peonia chain as a visit.

The existing tests establish useful pieces but not the full rank-2 repeat:
- `tests/agent39-peonia-owner-visited-slots.test.cjs` covers the helper's pure index, capacity, no-mutation, and paper-preflight semantics.
- `tests/root-k1-peonia-prize-sampling.test.cjs` stages the exact rank-2 source 60 and exercises Tag Call → Peonia → three Prize slots → three physical hand replacements → OrderCards, with source-zone conservation and owner Prize-sampling checks.
- The rank-29 native report and `simulation/twinleaf/agent39-rank29-peonia-original-print-native.cjs` exercise 1/2/3 selections in both physical seats through the original Store. That is valuable same-card mechanics evidence, but it is rank 29, uses a different list (including two Lusamine), and uses a constructed support state. It is not a rank-2 repeated-Peonia result.

## 2. Does the current actor-view projection expose enough?

**Not yet. The first Peonia prompt is identifiable, but the slot/count contract and subsequent prompt handling are insufficient for the intended policy.**

### Prize prompt

`simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, `projectChoosePrize` (around lines 476–517):

- Typed `prompt.source.sourcePrinting` / `effectName` can identify Peonia on a prompt when the provenance hook has attached it.
- It emits `selectionType:'prize-slots'`, `requiredCount`, owner seat, and opaque action tokens.
- Critically, each choice's `selectionIndex` is the **filtered index among nonempty Prize slots**, not the physical original Prize-slot index. The original index is used only in the human-readable label. The host must not parse that label or treat the filtered index as the helper's 0–5 physical index.
- It exposes no printed-rule minimum/maximum. `requiredCount` is derived from native `prompt.options.count`, which is the engine's exact-count contract (normally 3), not Peonia's paper “up to 3” contract.

Keep the filtered `selectionIndex` for native token resolution, but add a separate non-secret `slotIndex` / `originalSlotIndex` carrying `item.originalIndex`. For a typed actor-owned Peonia CRE prompt only, expose a paper range of minimum 1 and maximum `min(3, occupied slots)`, while preserving the native required count separately for diagnostics. The policy can then cap its selected count by its own computed safe-replacement capacity. Do not globally weaken other ChoosePrizePrompt effects.

### Hand replacement and order prompts

`projectChooseCards` (around lines 313–347) already exposes the actor-visible card printings, source zone, owner seat, and generic `minimumCount` / `maximumCount`. That is a useful base for choosing actual hand replacements; the host still owns the token-to-physical-card mapping.

However, the policy must verify that the replacement prompt's min/max actually encode the number of Prizes selected. If the native continuation does not expose that exact count, carry the Peonia-selected count through a host-owned typed continuation field rather than inferring it from prose or a generic card count. Safe replacement count is a strategic policy decision: it must protect needed setup/lock pieces, not simply equal the number of cards in hand.

The Peonia `OrderCardsPrompt` also needs explicit handling. The projection emits `selectionType:'card-order'`, but Agent10's recognized-source allowlist does not include Peonia. A deterministic order is fine only if the accepted slot-to-card settlement remains observable; do not update the visited ledger before that receipt.

One additional provenance uncertainty: `agent36-prompt-provenance.cjs` tags prompts created while `callReduceEffect` is on its stack. Its current tests cover a prompt created synchronously inside that effect, not later prompts created by resolving the first prompt's continuation. Verify that the replacement and order prompts retain the typed Peonia source; if not, provenance needs a host-owned continuation propagation mechanism. Do not trust a prompt's free-form message or an engine object's untrusted `sourceCard` property as a substitute.

## 3. Current Agent10 policy gaps

The current rank-2 policy is not Peonia-capable:

- Its card scoring explicitly returns zero for both Gladion and Peonia (the `scoreCard` branch around line 575), so Peonia is not selected for play.
- Lusamine's play score considers Guzma & Hala / Grand Tree discard targets, not Peonia.
- The Lusamine/Team Yell retrieval priority branch (around lines 654–657) omits Peonia, so a Peonia in the discard is not selected as a recovery target.
- `recognizedCardSource` in `promptDecision` omits Peonia. Its replacement `ChooseCardsPrompt` and `OrderCardsPrompt` therefore fail closed as unsupported sources rather than executing a Peonia plan.
- The `prize-slots` branch uses `requiredCount` and sorts by `choiceIndex`; the current projection emits `selectionIndex`, not `choiceIndex` or physical `slotIndex`. Thus it cannot implement the visited-slot plan and will take the native required count rather than the paper-valid 1/2/3 choice.
- The generic `ChoosePrizePrompt` fallback selects a single first choice, but a projected Prize prompt is normally intercepted earlier by `selectionType:'prize-slots'`; that fallback is not a Peonia solution.

The current Agent10 test file has no Peonia-specific policy case. Its zero-count Prize test is an unrelated generic empty-selection test.

## Reuse vs new policy assertions

**Reuse unchanged:**
1. `tests/agent39-peonia-owner-visited-slots.test.cjs` for pure helper behavior and the source-specific paper preflight.
2. `tests/root-k1-peonia-prize-sampling.test.cjs` for the exact rank-2 source-60 K0 staging, physical three-Prize Peonia chain, replacement conservation, and owner-only Prize ledger.
3. The rank-29 native 1/2/3 both-seat fixture/report as a reference for the same printed Peonia mechanics, while keeping its rank-29 scope explicit.

**Require rank-2 / policy-specific assertions:**
- Source inventory is one Peonia, one Lusamine, one Gladion; do not fixture two Lusamine.
- Peonia source recognition and a paper-valid 1/2/3 selection bounded by safe hand replacements.
- Physical original slot index survives projection separately from filtered native selection index, including gaps from previously taken Prizes.
- Replacement count exactly matches the selected Prize count; replacement choices are actor-owned hand cards and preserve reserved setup/lock resources.
- Peonia provenance persists through Prize, replacement, and order continuations.
- Accepted full-chain receipt is the only event that updates visited indices; stale, partial, rejected, reordered, shuffled, or reset state invalidates or rebuilds the ledger.
- Lusamine selects Peonia plus a legal second Supporter/Stadium when the single available copy is used to replay Peonia; do not assert an indefinite loop.

**Bottom line:** the helper is reusable and the existing rank-2 K0 fixture is a good base. The blocking work is source-count correction, original-slot metadata, Peonia-specific prompt range/selection and replacement/order policy, and a verified provenance/settlement path. This is a static policy-readiness finding, not a claim about rank-2 matchup strength.
