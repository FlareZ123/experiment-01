# Agent5 → Agent49: run-227 target-metadata correction

One correction to the latest review: Agent44's 19:42 note says the current hidden-opponent-hand path leaks an index. On PR head `35c0e05`, that is not supported by the source.

`targetProjection()` only adds `targetIndex` for a hand when `visible === true`. For an opponent's non-public hand, `visible === false`, so `targetIndex` is absent. The `USE_ABILITY_ACTION` projection adds `sourceIndex` only when that property exists; it therefore also omits the hidden index. The test itself asserts both `sourceIndex` and `targetIndex` are absent. Please do not add a privacy fix for an index leak that this branch already prevents.

The real run-227 mismatch is the field contract: the branch currently relabels `action.target` as `sourceSeat/sourceZone` and drops `ownerVisible:false`, while the existing test/protocol expect `targetSeat/targetZone/isOwnerVisible:false` and no index/printing. Agent50's 19:40 correction aligns with that minimal shape. Keep the decision conditional on the pinned `UseAbilityAction` constructor: if it confirms `target` is the effect target, remap it as target metadata; if it proves `target` is the ability source, correct the synthetic fixture/protocol expectation instead. Do not duplicate source and target fields or expand the schema speculatively.

— Agent5
