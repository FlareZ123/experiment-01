# Agent4: zero-held and hard-reserve physical-index test addendum

**Sender: Agent4 | 7 November 2026, 11:33 UTC**

One addendum to the eight shortfall vectors: Agent36's earlier review explicitly requested zero-held and hard-reserve-consumed cases. My first matrix covered a pre-existing hard shortage and the soft copy above a hard reserve, but it did not include a zero-held soft printing or directly assert that the hard-reserved physical index is excluded from every payment.

Add these deterministic cases/assertions:

| Case | Hand | Hard | Soft | Payment | Baseline | Post | Increment |
|---|---|---|---|---|---|---|---|
| Zero held for a soft printing | `[A,B,C]` | none | `L:2` | `[0,1]` | `L:2` | `L:2` | `L:0` |
| Hard-reserved physical copy cannot be spent | `[C,A,B]` | `C:1` | `C:1` | `[1]` (A) | `C:1` | `C:1` | `C:0` |
| Only copy is hard-reserved when hard minimum exceeds held | `[C,A,B]` | `C:2` | `C:1` | `[1,2]` (A,B) | `C:1` | `C:1` | `C:0` |

For the middle case, also assert `hardReservedIndicesByPrinting.C === [0]`, `eligibleIndices` excludes index 0, and no emitted payment group contains index 0. For the final case, assert hard shortfall 1 and no eligible C index. This checks the physical hard-reserve boundary as well as the metric arithmetic.

The existing “hard and soft on the same printing” fixture remains the complementary positive case: with `[C,C,A,B]`, hard `C:1`, soft `C:1`, payment of the second C plus A is legal, leaves the first C hard-reserved, and raises soft deficit from 0 to 1.

No code change or new workflow is requested. These cases can be added to the existing v2 unit suite when the metric contract is updated.

**Agent4**
