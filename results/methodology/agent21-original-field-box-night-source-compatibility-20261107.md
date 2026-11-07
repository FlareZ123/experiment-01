# Agent21: three authenticated original Aichi 60s have Secret Box + Night Stretcher, none have Box + Fog

**7 November 2026. Evidence: source-locked 29-list inventory audit, mechanical native-Store tests are separate. Zero qualified matches.**

## Reproducible roster audit

Source [`results/aichi-2026/full-decklists.json`](../aichi-2026/full-decklists.json) has authenticated 60-name/count entries for **29 of the 32** Aichi Open League 2026 top finishers. Exact lists for ranks **23,25,28** are unverified. The [source-only scanner](../../simulation/evaluation/agent21-source-box-recovery-item-coverage.cjs) deliberately counts **printed cards in registered 60s** and validates all counted sixty totals; [five deterministic V8 regression cases](../../tests/agent21-source-box-recovery-coverage.test.cjs) passed, including unknown ranks and duplicate/non-60 rejection.

- **Secret Box**: ten source 60s, ranks **4,5,8,9,11,16,17,19,22,30**.
- **Night Stretcher**: five, ranks **1,3,8,19,22**; each of the three intersecting Box lists has legitimate Basic Energy cards in its printed sixty.
- **Energy Retrieval**: zero verified source 60s.
- **Box ∩ Fog Crystal**: zero verified source 60s, reproducing Agent49's independent research.
- **Box ∩ Night Stretcher**: **three exact original lists**: rank8 Yusuke Kobayashi Absol/Garbodor (Box1, Night1, two expired-later Battle VIP Pass, Basic Energy7); rank19 Mark Takahashi Raging Bolt (Box1, Night2, VIP2, Basic Energy9, plus four Special Double Dragon); rank22 Haruya Mori Absol/Garbodor (Box1, Night2, VIP2, Basic Energy8).

None of these three source rosters has any Rescue Carrier. Thus the original hardcoded Agent43 `two VIP + Carrier` paid hand path, and Box→Fog route, **cannot be used verbatim for these originals**, even when either owner seat is technically supported. The literal card-name overlap is a source-deck compatibility constraint only; it is *not* a claim that the item route is drawn, paid, unlocked, or tactically profitable in a natural game. A viable bilateral adaptive policy must choose actual owner-held discard candidates and source-confirmed Item target classes, and distinguish an already exhausted deck target from K0 uncertainty.

## Native feasibility for the alternative generic route

Native `Energy Retrieval SVI` and `Night Stretcher SFA` each have a genuine owner-discard `ChooseCardsPrompt` able to recover Basic Energy. The exact larger [stage](../../tests/agent21-box-salvage-attack-native.test.cjs), in **real pinned Twinleaf at CI [42348618094](https://github.com/FlareZ123/experiment-01/actions/runs/42348618094), 4/4 passing**, executes **Secret Box → Recovery Item from owner deck → Basic Energy from public owner discard → ordinary attachment → Unown Hidden Power KO → Prize 6→5**, on both owner seats for both Item names. That staged Unown damage target and constructed hand **do not occur by assertion in the original three opponent decks**. The proof identifies a reusable *game-effect connector*, not an eligible source opponent action policy in any actual match. See [full receipts](agent21-native-box-salvage-ko-prize-20261107.md).

An independently [pinned-native negative study](agent21-pinned-native-box-fog-search-whiff-20261107.md) further shows Box and Fog with zero deck targets can legally `validate([])` and continue after payment. This matters when a source-specific Box Item target is Prized or unavailable; any generic AI must preserve the paid-but-whiffed native game rather than asserting an expected desired target.

## Decision consequence

The recurring original-player weakness is **decision policy competence**, not mere card-list intersection. At least three authentic sources have a potentially useful *different* Box Item recovery channel that a hardcoded Fog-only single-candidate test cannot reach. It should be prioritized as a source-visible prompt dispatch pattern, but the testable requirement is stronger: native complete attack versus the original fixed source under a legitimate new, preregistered deal, with unknown Prize locations protected, item/resource payment and opponent reply captured.

This does **not** imply Night Stretcher must enter the one target optimized 60 or that the rank8/19/22 sources have proven recovery attacks. The fixed-deck 99.5% objective remains unverified with **zero competitively qualified games**.
