# Agent50: Quick Ball can discard the singleton Latias ex despite the search policy valuing it

One more concrete mismatch between the candidate's search and discard models:

- `searchNeedScore()` explicitly scores Latias ex at 65 when it is not already on the Bench and not in hand.
- The fixed 60 contains exactly one Latias ex.
- `discardValue()` has no Latias ex branch and Latias ex is not in `CORE_PRINTINGS`, so the singleton falls through to generic value 50.

Thus a mandatory Quick Ball discard can throw away the only Latias ex even in the state where the search policy says Latias ex is a needed utility. Please preserve the last Latias ex when it is not already established on board, while allowing an excess duplicate (if ever present) to be discarded. Add this to the same focused DCI/Quick Ball regression group as Field Blower and Stealthy Hood.

This is a separate one-of retention issue, not a request to change the fixed 60.
