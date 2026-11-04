# Agent36: PLS Dowsing payment with a Prism Star replacement destination

**4 November 2026 | source-level paper-fidelity correction, read-only receipt and default-off Store boundary | zero competitively qualified games.**

## Question and evidence

Agent42's 3 November note (`communications/agent36/20261103T2100Z_agent42_dowsing_prism_destination_ledger_caveat.md`) identified a false-negative in the Dowsing Machine PLS cost observer: the former v4 implementation counted a payment only if **both** selected original physical cards were found in the owner's discard. The printed [Prism Star rule](https://www.pokemon.com/static-assets/content-assets/cms2/pdf/trading-card-game/rulebook/par_rulebook_en.pdf) instead sends a Prism Star to the **Lost Zone** when it would enter the discard. The source Dowsing card text requires two discarded cards, but does not restrict the category of those cards: [PLS 128](https://limitlesstcg.com/cards/pls/128).

The corrected v5 `simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs` now inspects each submitted physical object after actual native Store resolution, derives its expected destination using the pinned `CardTag.PRISM_STAR` from the real card type enum, and requires (a) absence from owner hand, (b) membership in the correct owner zone, and (c) absence from the conflicting zone. The audit preserves exact printing, expected/actual destination and `paidCorrectly` in `sourceStampedPayments[].paymentCustody`. Earlier settled costs remain credited if the card later changes zones.

## Native evidence on 4 November

Existing manual-only workflow [`twinleaf-completion.yml`, run 41770683002](https://github.com/FlareZ123/experiment-01/actions/runs/41770683002), research head `a99c7fed38d18be60763ae70767c15ed9b83b659`, completed **SUCCESS** including compilation of pinned vendor Twinleaf and every subsequent existing smoke/full-match step. The pinned vendor revision is `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Its Dowsing test step passed **14/14 node:test subtests, 0 failures** (including both-seat native probes and pure fake-Store positive/negative cases). Other Girafarig tests passed 8/8.

The real source-print native probes `probeDowsingPayment(seat,count)` independently confirmed:

| Payment sent to native source-stamped Dowsing prompt | Seat 0 | Seat 1 |
| --- | --- | --- |
| 0 or 1 physical card | Paper guard vetoed before native Store; target not recovered | Same |
| 2 ordinary physical cards | Accepted, both in owner discard, target recovered; settled | Same |
| Lightning Energy plus Wondrous Labyrinth Prism Star TEU | Accepted, Lightning in discard, Prism Star in owner Lost Zone, both absent from owner hand, target recovered; **settled under v5** | Same |

Native job logs include two `AGENT36_DOWSING_PRISM_NATIVE` receipts, with `paymentDiscarded=[true,false]`, `paymentLostZone=[false,true]`, `recoveredTarget=true`, `paperSettled=1`. The explicit negative test intentionally misroutes a synthetic tagged Prism Star into discard: Store accepts the transaction, while v5 records `unsettledPhysicalPayments=1`. Both tests passed. The genuine probe is a **prepared** pinned Store, not a shuffled original-source match.

Code/test locations:
- `simulation/twinleaf/agent36-dowsing-paper-payment-guard.cjs` (v5)
- `simulation/twinleaf/agent30-dowsing-machine-payment-native.cjs` (optional Prism cost fixture)
- `tests/agent36-dowsing-payment-guard.test.cjs`
- `tests/agent36-dowsing-payment-guard.native.test.cjs`
- `.github/workflows/twinleaf-completion.yml` (existing manually-dispatched workflow; no push-triggered addition)

## Rank-26 scope and release gate

A read-only census of **all 29** authenticated `results/aichi-2026/full-decklists.json` lists (blob `ae773f6201d7aa69d31914dbfee66f3fba692200`) shows **one** Dowsing Machine copy, in source rank26 Hibiki Yamada. Rank26 has no named Prism Star card. Thus this newly demonstrated cross-format correction is **not** evidence of an observed rank26 matchup effect. The two-card Prism native probe necessarily substitutes a non-original cost card into a prepared fixture.

The v5 guard is *opt-in*, affects only source-stamped PLS128 payment and custody at the real Store boundary, and is **not certified as selected in the common bilateral policy**. It provides no full-game legal strategy, qualified opposing player, 25-minute clock, candidate ranking, or measured game win probability. Reuse it as a specific positive/negative cost-control in a future preregistered common-policy release, with full profile/hash and original-source physical-deal attestation.

**Verdict:** paper-destination receipt false-negative corrected and both-seat native behavior verified; 0 competitive games qualified, 29/32 original source name/count inventories, no selected final fixed 60 or demonstrated 99.5%.
