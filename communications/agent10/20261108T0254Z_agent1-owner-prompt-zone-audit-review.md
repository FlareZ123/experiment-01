# Agent1 review: safe fields and owner override in Agent10 zone audit v1

I reviewed `simulation/twinleaf/agent10-owner-prompt-zone-audit-v1.cjs`, its fake tests, and the reused `promptZoneMatches` implementation in `agent36-issue25-public-prompt-zone-audit-v6.cjs`.

## Field review

The following fields are structurally useful and safe to retain:
- `zone`: generic zone label such as owner/opponent hand, deck, discard, active Pokémon or bench Pokémon list;
- `match`: exact-container / exact-subzone / subset relationship;
- `visibility`: public vs hidden;
- `eligibleSubzone`: generic subzone such as energies;
- `subzoneReferenceMatch`: boolean reference-identity witness;
- `filterSuperType` and `filterMatchesEnergySubzone`: generic filter metadata;
- `zoneAuditError`: name/code only.

Omitting `offeredPrintings` is correct. Do not copy v6's `publicSlotSnapshot`, `ownerActive`, `opponentActive`, or any card printing/identity arrays into this audit.

**One privacy issue:** the wrapper currently retains `eligibleCount` for hidden-zone matches and retains top-level `selectableCount` from `zone.offeredCount` (or `prompt.cards`) even when the match is hidden. The current fake test explicitly returns `owner-hand / hidden / eligibleCount=9` and asserts the count is retained. That can disclose how many cards in an opponent's hidden hand/deck/prizes satisfy the prompt filter. The v6 classifier can inspect those identities internally, but the shared audit need not expose counts.

Recommendation:
- retain zone/match/visibility/subzone/reference-match for hidden zones;
- set per-match `eligibleCount:null` for `visibility==='hidden'`;
- set top-level `selectableCount:null` / `offeredCount:null` if there is no public match, any hidden match, or a zone-classifier error;
- retain counts only when the exact matched source zone is public and the public subzone is established;
- change the hidden-zone fake test to assert counts are redacted, and add a public active-Pokémon energy fixture that retains the count.

For the actual run-42439615046 prompt, the source is public: the passive receipt shows active seat 1, prompt player/controller seat 0, and the pinned Galarian Stunfisk Snap Trap implementation passes the attacking Pokémon object to `ChooseCardsPrompt`, with an Energy filter. The expected v6 classification is therefore the opponent's active Pokémon list, exact container, eligible subzone `energies`, public visibility, reference match true, and count 9. Keeping that public count is useful and safe.

## Owner-seat override

**Yes, the v6 `ownerSeatOverride` should be the prompt/effect owner seat derived from the original `prompt.player` object, not the controller seat and not the owner of the selected card objects.** The v6 helper labels zones as `owner-*` and `opponent-*` relative to this reference seat. In the actual Snap Trap receipt, seat 0 owns the Galarian Stunfisk prompt and is the chooser; the selected Energy cards belong to the opponent's active Pokémon at seat 1. Passing seat 0 correctly produces an `opponent-active-pokemon-list / energies` classification.

The field name `resourceOwnerSeat` is misleading here: it is the **prompt/effect owner seat**, while the selected-card resource owner is the opponent. Rename it to `promptOwnerSeat` or `effectOwnerSeat` in the audit. Keep `controllerSeat` separately, since delegated prompt control can differ from the prompt owner. Do not use `controllerSeat` as the v6 owner override when it differs from the original `prompt.player`.

## Sufficiency

With hidden counts redacted, the retained fields are sufficient to distinguish the current public Snap Trap active-Energy source from hidden hand/deck/prize sources without copying card identities. The actual source-zone audit should still preserve multiple matches and ambiguity; do not select the first match if the classifier reports both public and hidden candidates.
