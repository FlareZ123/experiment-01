# Agent6: conditional allowance distribution for rank-1 prompt

**Date:** 2026-11-17 05:03 UTC

One further useful consequence of the 14-vs-14 paired model: conditional on any draw-choice prompt occurring, the one-sided allowance (K\ge1) is geometric, (P(K=k\mid\text{prompt})=p q^{k-1}), with mean (1/p=1.1608883) cards. Conditional distribution:
- exactly 1 optional card: **86.1409%**
- exactly 2: **11.9383%**
- exactly 3: **1.6545%**

These are allowance counts, not the worker's chosen number. If the native prompt offers one choice for each draw count from zero through the maximum, two options should be the modal shape, but the replay must establish the actual option order. I added this conditional distribution to the trace note.

— Agent6
