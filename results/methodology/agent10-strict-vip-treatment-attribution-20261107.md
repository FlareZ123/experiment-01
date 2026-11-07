# Agent 10: strict VIP treatment attribution

**7 November 2026 | Methodology helper for the v10b/v10c paired comparison.** This is a fail-closed attribution rule and pure fixture test. It is not a native-game result or evidence of competitive strength.

## Question

Can a paired comparison label a treatment as a Battle VIP Pass intervention from the first public root-ledger divergence, while also proving the native Item and search were accepted and the search physically moved Basic Pokémon from the owner's deck to Bench?

## Existing evidence and gap

The current v10b comparator's permissive predicate relies on a string search for VIP in the treatment root, a Pass-like control root, and a PlayCard-like treatment action. It does not require an exact printing, the same actor seat and turn, an accepted VIP Item event, or a physically confirmed search. A later VIP substring or a different PlayCard root can therefore be misattributed.

The existing research-owned owner VIP adapter exposes enough sanitized receipt data to build a stronger join. Its examples distinguish:

- `vip-item`: exact printing, seat, turn, and native acceptance;
- `vip-search`: seat, turn, selected printings, native acceptance, `nativeBenchConfirmed`, and before/after Bench and deck counts.

These fields are emitted by `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs`.

## Implemented rule

`simulation/evaluation/agent10-strict-vip-treatment-attribution.cjs` exports `strictVipTreatmentAttribution` and the boolean convenience function `firstTreatmentDifferenceIsVip`.

The helper accepts only when all conditions hold:

1. The first exact public-ledger divergence is paired. The control root is `PassTurnAction` and the treatment root is `PlayCardAction` for the exact `Battle VIP Pass FST` printing.
2. Both roots identify the same physical seat and turn. If action ordinals are present, both must be valid and equal.
3. The sanitized native VIP audit is recorded.
4. A later accepted `vip-item` event for the exact printing and an accepted `vip-search` event exist for that same seat and turn.
5. The search reports `nativeBenchConfirmed === true`, selects one or two physical Basic printings, and the positive Bench increase and deck decrease both equal the selected count.

Any missing, conflicting, unpaired, zero-card, wrong-seat, wrong-turn, wrong-printing, or unconfirmed evidence fails closed. A later VIP event cannot rescue an earlier unrelated root divergence.

## Verification

- Pure Node 22 fixture suite: **16/16 passed** with `node --test tests/2026-11/agent10-strict-vip-treatment-attribution.test.cjs` in a temporary local reproduction of the committed helper and tests.
- Adversarial cases cover seat/turn mismatch, absent item/search receipts, wrong printing, unconfirmed search, inconsistent physical deltas, zero-card search, event ordering, wrong first root, earlier unrelated divergence, conflicting aliases, mismatched ordinals, missing audit, missing ledgers, and unchanged controls.
- The helper is committed separately from the historical v10b runner. It has not been integrated into v10c, run against a native Twinleaf game, or validated in CI.

## Limitations and next step

The existing VIP audit example array is capped at 40 records. If the relevant event is omitted, the helper intentionally declines attribution. The current audit events also do not expose a root action ordinal or prompt ID, so the item/search pairing uses exact seat, turn, event order, and physical deck/Bench receipts. Adding an explicit Store root ordinal or prompt correlation ID would make the event join stronger.

Agent 36 and Agent 41 were sent the helper and test paths for review and v10c integration. Keep the mutated v10b runner and its failed result immutable; any repaired experiment should receive a new version, fresh registration, and fresh seeds.

**Interpretation:** this improves attribution validity only. It says nothing about paper legality of the full policy, match completion, matchup strength, or the 99.5% target.
