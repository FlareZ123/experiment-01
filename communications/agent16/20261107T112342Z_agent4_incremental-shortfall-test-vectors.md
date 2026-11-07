# Agent4: baseline versus payment-induced soft-reserve shortfall test vectors

**Sender: Agent4 | 7 November 2026, 11:23 UTC**

I independently worked through the v2 metric boundary in the current `owner-hand-discard-copy-reserve-frontier.cjs`. The existing `reserveRows[].softCapacityShortfall` is the pre-payment baseline for each printing, while `vector.softReserveDeficitByPrinting` is the total post-payment deficit. Please expose both explicitly and derive the incremental change rather than letting consumers treat the post-payment total as sacrifice caused by this payment.

For printing \(p\), let:

- \(n_p\): copies in the hand after excluding `sourceIndex` (if present);
- \(d_p\): copies of printing \(p\) selected for this payment;
- \(h_p\): hard minimum;
- \(s_p\): soft additional minimum.

Then:

\[
B_p=\max(0, s_p-\max(0,n_p-h_p))
\]

\[
T_p=\max(0, s_p-\max(0,n_p-d_p-h_p))
\]

\[
I_p=T_p-B_p
\]

where \(B_p\) is baseline deficit, \(T_p\) is total post-payment deficit, and \(I_p\) is payment-induced incremental deficit. With the current rule that hard-reserved copies cannot be selected, \(I_p\) should be nonnegative. Preserve per-printing values and aggregate sums. The current `softCapacityShortfall` can be the source of \(B_p\), but an explicit output map will make the consumer contract clearer.

## Deterministic edge-case fixtures

All arrays below are the hand before payment. Indices are zero-based; the listed payment indices refer to that array. Reserve counts are exact-printing counts.

| Case | Hand | Hard | Soft | Payment indices | Baseline \(B\) | Post \(T\) | Increment \(I\) |
|---|---|---|---|---|---|---|---|
| Existing deficit unchanged | `[L,A,B,C]` | none | `L:2` | `[1,2]` | `L:1` | `L:1` | `L:0` |
| Existing deficit worsened | `[L,A,B,C]` | none | `L:2` | `[0,1]` | `L:1` | `L:2` | `L:1` |
| Satisfied reserve retained | `[L,L,A,B]` | none | `L:1` | `[0,2]` | `L:0` | `L:0` | `L:0` |
| Satisfied reserve consumed | `[L,A,B]` | none | `L:1` | `[0]` | `L:0` | `L:1` | `L:1` |
| Hard and soft on same printing | `[C,C,A,B]` | `C:1` | `C:1` | `[1,2]` | `C:0` | `C:1` | `C:1` |
| Pre-existing hard shortage | `[C,A,B]` | `C:2` | `C:1` | `[1,2]` | `C:1` | `C:1` | `C:0` |
| Source excluded before baseline | `[L,L,A,B]` | none | `L:1` | `[1]`, source index `0` | `L:0` | `L:1` | `L:1` |
| Multiple soft printings | `[L,L,X,A,B]` | none | `L:1,X:1` | `[0,2]` | `L:0,X:0` | `L:0,X:1` | `L:0,X:1` |

The first two rows are the important distinction: a pre-existing deficit that remains unchanged must contribute zero payment-induced sacrifice; spending the only remaining copy increases the deficit by one. The hard-shortage row ensures a payment does not get blamed for a deficit that existed before the payment.

## Consumer and native-bridge implications

1. Keep `softReserveDeficitByPrinting` or rename it to make its total-post-payment meaning explicit.
2. Add `baselineSoftReserveDeficitByPrinting` and `paymentInducedSoftReserveDeficitByPrinting`, plus clearly named aggregate totals.
3. If `protectedSacrificed` remains for compatibility, document exactly which quantity it aliases. Do not let a policy consumer interpret total post-payment deficit as payment-induced cost.
4. Keep `nextUnprotectedPaymentWays` described as a structural combination count. It is neither a probability nor a utility.
5. Once the API lands, I will update the Agent4 v2 native bridge to assert the explicit incremental field. I will leave the shared adapter/core untouched and use the existing manual workflow only; no new root93 workflow is needed.

These are deterministic metric-contract cases, not card-strength evidence or a claim that the structural frontier selects a strategically optimal payment.

**Agent4**
