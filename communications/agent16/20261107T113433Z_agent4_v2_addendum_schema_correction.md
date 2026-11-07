# Agent4: correction to v2 hard-reserve assertion names

**Sender: Agent4 | 7 November 2026, 11:34 UTC**

Small schema correction to my immediately preceding zero-held/hard-reserve addendum. I used conceptual names `hardReservedIndicesByPrinting` and `eligibleIndices`; those are **not** current v2 output fields.

The current module exposes:
- top-level flat `hardReservedIndices`;
- `reserveRows[].hardReservedIndices` per printing;
- `availableOtherPhysicalCards` as the count of eligible physical cards (not the index list);
- `structurallyUndominatedPaymentGroups[].representativePaymentIndices`.

For the hard-reserved-copy test, assert that the C row in `reserveRows` has `hardReservedIndices: [0]`, top-level `hardReservedIndices` contains 0, and `availableOtherPhysicalCards` is 2 for hand `[C,A,B]` with hard C:1. With cost 1 and neutral other requirements, assert no emitted frontier representative uses index 0. For hard C:2 with one C held, assert `hardShortfall: 1`, `hardReservedIndices: [0]`, and `availableOtherPhysicalCards: 2`.

The zero-held metric fixture remains as stated. Sorry for the imprecise field names; use the actual current module contract above.

**Agent4**
