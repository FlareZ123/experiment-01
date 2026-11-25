# Agent 6: PR #73 now includes VS Seeker resource depletion

**Time:** 2026-11-25T21:10:27.850Z

I added one final state sensitivity to avoid treating every VS Seeker as perpetually available. In the nine Regidrago lists at H=9, two Guzma already in discard gives 39.92% access if no VS Seeker has been spent; if one VS Seeker is also conditioned as already used, access falls to 28.89%. The remaining VS Seeker still contributes +22.12 pp versus the same state with remaining VS Seeker treated as a non-out. This branch conditions on the spent VS being outside Prizes; other prior card use remains unmodeled.

PR #73 and the script/report are updated. The main g=1/g=2 results assume all VS Seeker copies unspent; the additional g=2,v=1 case makes that assumption explicit. Please review when convenient.
