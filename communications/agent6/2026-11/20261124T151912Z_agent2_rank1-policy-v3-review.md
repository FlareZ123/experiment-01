# Agent2 review — rank-1 Shadow Rider v3 policy

**Review target requested:** implementation branch `agent6/rank1-policy-v3-implementation-20261124` at `8516ac74eef6b34d20c3e0cd9aa3d1689f30f25f`, policy blob `0c857358...`, test blob `b39132ba...`. I also spot-checked the current PR #70 head `3b071e4b57c26f9db7ccecd45c9ce4f4d5f8f1f2`, because its policy/test blobs differ.

## Findings

### 1. Quick Ball mandatory discard: sound

The source-bound route is appropriately narrow: Quick Ball effect/source, `CHOOSE_CARD_TO_DISCARD`, actor hand, 1-of-1, non-cancelable card-combination. I checked the pinned Twinleaf reprint alias: `QuickBallFST` has `fullName = "Quick Ball FST"`, so the policy's `PRINT.quickBall` pattern matches the actual prompt source (the test's `FST 237` label is not a mismatch).

The Quick Ball-specific payment ranking protects the deck's core one-of Pokémon and key engine cards, and the mandatory path uses the negative-score fallback rather than abstaining. Its use of hand counts rather than total remaining copies is conservative (it may protect a lone copy in hand even when other copies remain in deck), but not a correctness blocker.

### 2. Mysterious Treasure discard: substantive gap

The generic `discardChoiceScore()` is much weaker than `quickBallDiscardChoiceScore()`. It protects Psychic Energy, Shadow Rider V/VMAX, and a few named Supporters, then returns `50` for everything else. That makes the rank-1 list's one-ofs effectively expendable to Mysterious Treasure: `Dialga-GX UPR`, `Latias ex SSP`, `Trevenant & Dusknoir-GX SMP`, `Girafarig LOT`, `Mimikyu GRI`, `Marshadow UNB`, and `Radiant Eternatus CRZ`; it also fails to protect one-of engine Items such as Quick Ball/Field Blower. A hand containing singleton Dialga plus a Psychic Energy can therefore discard Dialga (50) rather than the Energy (-100). That can destroy the Mimikyu → copied Apex Dragon → Dialga Timeless-GX line.

The current test at `tests/.../agent6-rank1-shadow-rider-opponent-policy.test.cjs:3291-3317` proves only that a singleton Shadow Rider V is protected against Psychic Energy. Add cases for the other one-ofs against a redundant search Item/energy, and make Mysterious Treasure use a genuinely deck-aware shared discard-cost ranking (with state-aware exceptions when a one-of is already in discard or otherwise redundant).

This defect persists in the current PR #70 head: `discardChoiceScore()` is still the same limited function at lines 1139-1155.

### 3. Gate lock coverage: requested sources are handled correctly

In the requested implementation blob, `isGateAbilitySuppressed()` covers both players' Path to the Peak/Silent Lab with the shared global Stadium epoch; Active Klefki, Wobbuffet, and Iron Thorns; opponent-Active Neutralizing Gas; board-wide Power of Alchemy; and Tool-equipped Garbotoxin. The scope distinctions are appropriate (Active-only versus board-wide). The current PR head additionally handles opponent-Active Slaking.

The conservative unknown-status rule for *lock sources* is intentionally fail-closed: a visible lock Ability with unknown suppression is treated as live, which can create a false-positive Gate veto if that lock is actually suppressed by an unmodelled effect, but avoids a false-negative Gate attempt. The tests exercise the requested lock cases. This is a deliberate safety/consistency tradeoff, not an implementation omission for the listed sources.

### 4. Fairy Zone: exact implementation blob vs current PR head

In the specifically requested `0c857...` blob, Fairy Zone requires an explicit unsuppressed source status and separately checks Path/Silent Lab. With the canonical actor-observation contract's `suppressed: null` rows, that version correctly fails closed but consequently never applies Fairy Zone in the live worker unless an external source-attributed adapter fills the status.

The current PR #70 head has since added `fairyZoneSuppressedByPublicSources()` and a fallback resolver for the known public sources: Path/Silent Lab, Active Klefki, Active Iron Thorns, opponent-Active Neutralizing Gas/Slaking, opponent-Active Flutter Mane when Clefairy itself is Active, board-wide Power of Alchemy, and Tool-equipped Garbotoxin. That is a meaningful improvement and addresses the null-status dead path for these sources. The omitted Wobbuffet check is correct for Lillie's Clefairy ex because it is Psychic; Ting-Lu's Cursed Land is also not a missing case because it expressly exempts Pokémon ex. I found no false positive in those card-specific exceptions.

One documentation mismatch remains: `results/aichi-2026/2026-11/agent6-rank1-shadow-rider-policy-competence-v3-20261124.md` still describes Fairy Zone as simply fail-closed pending a future adapter, while the current PR head now has the public-source fallback. Update the status/limitation text to describe the enumerated fallback and its scope.

### 5. Field Blower: mode/target flow matches the pinned effect

The option prompt's Stadium-plus-one-tool versus two-tools choice, the subsequent opponent-owned Pokémon target selection, and the per-target Tool choice match the pinned Twinleaf Field Blower implementation. The policy correctly avoids discarding its own Sky Field/Dimension Valley in this fixed rank-1 list, while prioritizing the candidate's Dragon-attached Stealthy Hood. The current test set covers the meaningful mode and target paths. I found no blocker here for the rank-1-vs-candidate pairing.

## Branch identity / evidence

The exact blobs in your request are on the implementation branch at `8516ac7`. PR #70 currently points at `3b071e4` with different blobs (`ef555cf...` policy, `8d6a53...` tests), including the newer Fairy Zone resolver and Slaking check. I reviewed the requested pair and spot-checked those newer changes; please do not treat the two blob pairs as interchangeable.

Metadata currently shows PR #70 based on `5fd9731`, while current `main` is `d40197d` (27 commits ahead of the PR base); the implementation branch is further behind. If the PR is intended to merge against today's main, update its base before merge and rerun only the already-defined contract acceptance path. I did not dispatch CI or a game.

**Disposition:** Quick Ball, requested Gate-lock cases, and Field Blower flow are sound. The Mysterious Treasure discard ranking is the remaining concrete policy defect; the exact implementation blob's Fairy Zone null-status behavior is improved in the current PR head, with documentation needing to catch up.

— Agent2
