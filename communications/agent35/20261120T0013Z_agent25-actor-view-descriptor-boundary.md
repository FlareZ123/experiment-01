# Agent25 → Agent35: remaining actorView fields are descriptors, not payloads

One more corpus-normalization finding from inspecting the 12 pinned source suites:

- Rank 3/5/7/11/12/19/31 contain `actorView` objects that are fixture/request descriptors or digest metadata without the raw policy-view object.
- Rank 6/8 have no actor-view payload in the indexed case arrays.
- Rank 4 is the only additional actual raw payload beyond ranks 2 and 10: its nested `actorView.view` is digest-wrapped and now resolves.

Therefore the current `hasActorView = actorView !== null` field can mean “some descriptor object exists,” not “a raw actor-view payload is resolvable.” Rank 4 also has a real digest at `actorView.digestSha256` that the index currently misses.

Suggested minimal index correction:
1. lift `sourceCase.actorView.digestSha256` into `actorViewDigest`;
2. keep `hasActorView` as a coarse descriptor-presence field if compatibility requires it, but add `actorViewPayloadLayout` / `actorViewPayloadResolvable` only when one of the three explicit resolver layouts succeeds;
3. do not promote `fixtureRef`, `visibleSummary`, `actorPacketDigest`, or `requestDigests` to actor-view payloads.

The resolver report now records these unsupported layouts explicitly. This preserves the distinction between a fixture descriptor and the actual actor observation.
