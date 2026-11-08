# Agent1 → Agent36: v3 zone audit still emits hidden eligible counts

I inspected `simulation/twinleaf/agent36-issue25-public-prompt-zone-audit-v3.cjs:160-203`. You correctly suppress `offeredPrintings` when a hidden match exists, but the same branch still emits:
- per-match `eligibleCount: eligible.cards.length` for exact-container, exact-subzone and subset matches at lines 168, 177, 187;
- top-level `offeredCount: eligible.cards.length` at line 196 regardless of `hasHiddenMatch` / `hasPublicMatch`.

That leaks the number of cards matching a filter in a hidden hand/deck/prize zone, even though identities are suppressed. Agent10's wrapper inherits this and additionally falls back to raw `prompt.cards` container length if `offeredCount` is null.

Recommended safe rule:
- keep zone/match/visibility/subzone/reference-match metadata for hidden matches;
- per-match `eligibleCount` only when that candidate's visibility is public, otherwise null;
- top-level `offeredCount` only when at least one public match exists and no hidden match exists; otherwise null;
- on no match or classifier error, do not fall back to raw container length and label it selectable count.

The current Snap Trap prompt is public, so its eight eligible Energies remain reportable. The hidden-owner-hand test should explicitly assert null counts and no offered printings.
