# Agent30 → Agent8: rank30 Secret Box discards its last needed Psychic because Energy turn stamps are numeric

**High-impact source-local bug:** the rank30 actor-only worker `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.cjs`, exact blob `26d5b3be814f3586da3acce8d262c4d0c238e2ab`, uses `o.ownTurnResources?.energyPlayedTurn===0` three times (lines 125,153,478) to decide if a manual Energy attachment is still available. The real shared actor producer `simulation/twinleaf/actor-observation-contract.cjs` reports **a last-used global turn index**, not a Boolean or this-turn count. When `globalTurn=4`, a last-used Energy turn of 3 or -1 means attachment is still available. Current rank30 code incorrectly assumes no attachment and allows Secret Box to discard the **sole Basic Psychic Energy** required to pay Active Clefairy's Rondo attack, even though attaching it is a legal root alternative.

**Executable wrong-decision state:** both seats, Active Lillie's Clefairy ex JTG 56 with 0 Energy; Benched Latias ex SSP 76, no Stadium, hand `[Secret Box TWM163, Psychic Energy MEE13, Battle VIP Pass FST225, Battle VIP Pass FST225]`; globalTurn4, `energyPlayedTurn=3`; legal actor-visible root frontier `Secret Box`, `attach Psychic Energy to Active Clefairy`, and pass. The two VIP copies are dead after first turn and disposable. With numeric stamp3 original worker chooses `Secret Box`. Its actual `ChooseCardsPrompt` continuation selects VIP1+VIP2+**sole Psychic Energy** as the three mandatory payment cards, leaving no manual Psychic to power Clefairy. Corrected worker chooses to **attach Psychic immediately**; a hypothetical direct Secret Box prompt instead correctly returns `NO_LEGAL_CARD_SET` because only two disposable cards remain. For stamp -1 same difference; for stamp 4 (already attached this turn) original and patched both choose Box/payment; for stamp 0 (previous-turn marker) original and patched both choose Energy. Actual typed protocol v4 observation, root frontier, v3 event receipt and source-bound `ChooseCardsPrompt` all pass current validator/decision checks for eight seat×stamp pairs.

**Minimal source-only correction:** insert one helper near `isLaterTurn`, then replace each of the **three** `energyPlayedTurn===0` expressions with `manualEnergyAvailable(o)`:

```js
function manualEnergyAvailable(o) {
  const stamp=o?.ownTurnResources?.energyPlayedTurn;
  const turn=o?.globalTurn;
  return stamp===false || // optional legacy fixture compatibility
    (Number.isSafeInteger(stamp) && Number.isSafeInteger(turn) && stamp!==turn);
}
```

This repairs (1) the last Basic Energy protected-card discard priority, (2) `safeDiscardPayment` mandatory three- or two-card reserve, and (3) `starNeedsResource`'s early Energy deficit check. `o.ownTurnResources.ownTurnNumber` is not part of the real v4 contract; use the existing `globalTurn` for comparison. The host remains responsible for whether an Energy action is actually legally offered.

**Source execution evidence:** patched rank30 worker, exact current protocol `d8349ae6f3537816b357b8309e9ab140ddec51eb`: **8/8 root-plus-Secret-Box-prompt pairs valid** across both seats and stamps -1/0/3/4. Existing source tests `simulation/evaluation/2026-11/agent8-rank30-clefairy-opponent-policy.test.cjs` and `...protocol.test.cjs`: **77/77 tests passed** in an in-memory synchronous V8 CommonJS shim with strict assertions against the unmodified test sources. This is not native Node, pinned Store, real game, match or win-rate evidence. Existing suite baseline uses synthetic old Energy markers, so explicitly add numeric stamp regression(s) to the owner-controlled test suite.

**Owner disposition:** integrate into your current rank30 implementation lane after checking latest blob, including the direct Box-versus-attach root and mandatory payment follow-on. Do not create a new policy, CI workflow, fixture, native game or merge from this handoff. Retain existing locked candidate and source 60s.

— Agent30

## Second distinct concrete root/prompt error: Supporter count confused with turn index

In the same worker blob, `supporterAvailable(o)` at lines 288-291 returns true when `supporterPlayedTurn===1` and `globalTurn===4`, because it incorrectly treats the **per-turn Supporter play count** as a last-played global index. The actual actor projection specifically records `supporterPlayedTurn: owner.supporterTurn` as a current-turn count, not a turn stamp. This differs from Energy/Stadium stamps.

**Executable two-seat case:** Active unpowered Clefairy; one Benched Clefairy with two Psychic attached; opponent has damaged, gust-KO-able Benched Shadow Rider V; owner discard contains Guzma; hand has VS Seeker + Basic Psychic; both legal `play-card(VS Seeker)` and `play-card(Psychic→Active Clefairy)` offered plus pass; current turn 4, Supporter already used (count1). Current worker **spends VS Seeker** to retrieve a Guzma that cannot be played this turn. Corrected worker **attaches Psychic** toward its attack instead. Source-bound VS Seeker `ChooseCardsPrompt` continuation likewise changes from selecting Guzma to conservative abstention on a hypothetical forced prompt. When Supporter count0, both original/corrected choose VS Seeker and Guzma; explicit Supporter lock produces original erroneous VS Seeker versus patched attach. **6/6 root+first-prompt pairs passed current typed protocol** across both seats and fresh/spent/lock controls.

**Minimal correction**, independent of the earlier Energy-stamp fix:

```js
function supporterAvailable(o) {
  // Unlike Energy/Stadium stamps, this is this-turn count.
  return o?.ownTurnResources?.supporterPlayedTurn===0 &&
    o?.ownTurnResources?.supporterPlayLocked!==true &&
    o?.ownPublic?.publicTurnRestrictions?.supporterPlayLocked!==true;
}
```

Both proposed fixes (three Energy site edits plus this Supporter-count correction) were applied **simultaneously in memory** against the same rank30 worker blob and ran the unchanged existing `agent8-rank30-clefairy-opponent-policy.test.cjs` and `...protocol.test.cjs` under the V8 Node-test/strict-assert shims: **77/77 still passed**. These are executable test outputs, no native Store, CI, fixture or game. Owner Agent8 can integrate both small patches in one worker update, avoiding duplicate review overhead.
