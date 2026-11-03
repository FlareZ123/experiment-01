# Roxanne ASR: an eighth original-field whole-hand Supporter with a public opponent-Prize gate

**Agent 49 | 3 November 2026 | exact original printed source and necessary-condition audit**

## Source correction to the prior seven-printing census

The [seven-print source report](agent49-seven-source-supporter-bulk-owner-hand-synthesis-20261103.md) described seven exact full-hand Supporter printings, 87 physical copies across 67 original deck-printing rows. A follow-up exhaustive original-Trainer-name audit against the bundled English card corpus uncovered an additional relevant original print:

- **Roxanne ASR**, source English ID `swsh10-150`: **two physical copies**, one each in original field ranks **8** and **22** (two distinct Absol/Garbodor sources). Printed text: the Supporter requires the **opponent to have at most three remaining Prize cards**; then both players shuffle their remaining hands into their respective decks, the owner draws six cards and the opponent two.
- Unlike N, Roxanne has a printed late-game use restriction. Her owner hand effect is mandatory when legally played, and displaces all other originally held owner copies, including protected potential Trainer lines. Opponent hand identities remain concealed and unmodeled. A public Prize count above three establishes an **independent negative prerequisite**, while a count at most three establishes only that this one prerequisite is satisfied. A missing/out-of-range public Prize count remains UNKNOWN.
- This late-game reset can have disproportionate tactical value, which is precisely why its low two-copy source frequency should not be confused with low strategic importance.

The [exact-print owner transition model](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs) now recognizes **eight source printings, 89 original physical copies, 69 source deck-printing rows**. In addition to destination `deck`, it records `sourceRequiresOpponentPrizeThreshold:3`, tri-state `conditionalPrizeUseEligible`, and negative `sourcePrerequisiteFails`. An owner draw request of six is surfaced only if the public opponent-Prize predicate is positively witnessed; `printedDrawIfAdmissible:6` identifies the conditional card text even when eligibility is unknown or false. Nothing certifies that the full paper action was legal, physically selected, accepted by native Store, or tactically good.

The separate previously vetted **259** physical fixed-cardinality Trainer cost copies and now **89** original full-hand Supporter copies give **348/1,035 (33.62%)** original physical Trainer copies with one kind of exact hand-resource representation. This is a count of card-copy *models*, not qualified playable options, independent matches, or win percentage. An additional source Item **Unfair Stamp TWM** also affects both players' hands but has a Knock Out temporal restriction, and remains deliberately outside this eight-*Supporter*-printing model.

## Validation and limitations

- [Original-source roster](full-decklists.json) confirms Roxanne's two original copies and exactly 29 authenticated whole printed sixties; ranks 23, 25 and 28 still lack authenticated source lists.
- [All-eight card text regression](../../tests/agent49-original-bulk-hand-source-text.test.cjs) checks the complete Roxanne ASR English card clause against `resources/cards/en/swsh10.json`, alongside the other seven printings; [owner-hand and public Prize regression](../../tests/agent49-owner-bulk-hand-transitions.test.cjs) checks opponent Prize = 3, 4 and unknown as respectively satisfied, proven failed and unresolved, with paper-playability never positively certified.
- The first eight-print suite succeeded in [manual Node 22 CI 41717481481](https://github.com/FlareZ123/experiment-01/actions/runs/41717481481) with module source head `2069420b08b9b21675b4287142f35c06d10143b1`. The subsequent stricter unknown-Prize draw reporting, including explicit UNKNOWN on unverified or out-of-range public Prize counts, passed [manual Node 22 CI 41717716398](https://github.com/FlareZ123/experiment-01/actions/runs/41717716398), source pin `9a84e4ca7da26baf89a3401e925822b1bfd27a6d`.
- The previously reported true Store [rank5/rank11 four-print A/B/A 41711552049](https://github.com/FlareZ123/experiment-01/actions/runs/41711552049) predates this eighth printing and does not establish native Roxanne settlement.

The next competitive milestone remains a single actually selected, owner-information-safe, paper-screened two-seat policy with a reproduced source attack/control payoff and consequential competent opposing reply. Static source counts do not qualify games. **No selected final fixed 60, zero competitively qualified games, 29/32 complete original source lists and no demonstrated 99.5% win rate.**
