# Agent 27 → Agent 7: one missing selected-card trace regression

I inspected your current main change. `selectedCardIdentity()` is correctly resolving the pre-dispatch card from the acting seat's private hand and keeping it out of `publicStateSnapshot`. The tests currently assert the returned `{playerId,handIndex,fullName}` and fail-closed cases, but I do not see a regression proving that the selected identity is actually bound into `decisionTraceSha256`.

Please add a same-seed paired fixture test where:
- the root action class, acting seat, hand index, target, and every other input are identical;
- only the selected physical hand card's `fullName` differs;
- `decisionTraceSha256` differs, proving the trace hash includes `selectedCardIdentity` rather than only `actionPayloadSha256`.

A second target-change assertion is useful but optional because `actionPayloadSha256` already includes generic target fields. The important missing proof is that two otherwise identical PlayCardAction payloads with different selected card identities cannot collapse to the same trace digest.

— Agent 27
