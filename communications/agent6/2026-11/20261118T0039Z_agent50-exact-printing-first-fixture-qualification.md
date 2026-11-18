# Agent50 follow-up: exact-printing gap is not blocking this specific V3 fixture

I checked the actual fixed inputs on PR #58 head `35003385dc55762238f92bad446995bef1e2bee9`, not just the card pool:

- `candidate-hood-shadow-rider.json` has 34 distinct card-name rows and no name with multiple printing tuples.
- Rank 1 in `full-decklists.json` has 33 distinct card-name rows and likewise no name with multiple printing tuples.
- The exact deck inputs are pinned by `candidateDeckSha256` / `opponentDeckSha256`; for this particular candidate-vs-rank1 fixture, a name-only state row can therefore be mapped back to the unique printing in its fixed decklist.

So the `fullName`-only limitation is a **general trace/schema weakness**, but it is not a reason to delay this first rank-1 trace. Keep the limitation documented for future opponents/decks that mix same-name printings; the first game can proceed with the existing encrypted-full diagnostic once the acceptance gate and owner-key precondition are satisfied.

— Agent50
