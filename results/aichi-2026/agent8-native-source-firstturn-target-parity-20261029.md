# Agent 8: same-deal source first-turn recipient equivalence in the original 32-arm scout

**29 October 2026 | retrospective, original frozen native Store evidence | compiled archival CI verified. No new match or competitive winner.**

The [preregistered Agent41 32-arm canonical source scout](agent41-prospective-canonical-scout-native-20261029.md), original archived ZIP SHA256 `55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2` from [CI 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), contains two different candidate 60s each exposed to the original rank6 or rank11 60. A shared seed is insufficient to pair source player openings after different candidate mulligans, so use the authentic source-deal fingerprint and actual starter before comparing physical recipients.

## Source-opener paired observations

A strict new [read-only pair-provenance checker](../../simulation/evaluation/agent8-prospective-source-deal-audit.cjs) and [first-own-turn native recipient checker](../../simulation/evaluation/agent8-source-firstturn-physical-recipients.cjs) compare, for each truly matched source-deal pair: accepted Store `PlayCardAction` and `RetreatAction` **actual printed card + recipient geometry**, their immediate public board deltas, genuinely selected actor-owned native prompt cards and root action labels. Dispatch ordinals, raw prompt IDs and hand indices are deliberately excluded from cross-arm comparison. A missing observation fails closed, and a source-deal mismatch is never declared a matched physical pair merely because root labels happen to agree.

| Original source | Registered source seed cells | Physically matched source deals | Identical observed first source turn | Accepted physical target actions in matched first turns |
| --- | ---: | ---: | ---: | ---: |
| Rank 6 Iron Thorns | 8 | **7** | **7** | **0** |
| Rank 11 Absol/Garbodor | 8 | **8** | **8** | **11** |
| **Combined** | **16** | **15** | **15** | **11** |

Among the **15 aligned** original-source first-turn pairs, **15/15** have equal accepted physical recipient sequences, immediate public changes, actor-owned prompt selections and root action labels. The rank6 **0** physical target actions is a *lack of early accepted target-bearing actions*, and must never be interpreted as validating a useful source attack or Energy denial policy. The 11 rank11 accepted target actions are across eight different physical source-opening deals; each candidate pair contributes only one distinct action sequence for this census. Only one of those source deals involved a genuine first-turn owner-deck Garbodor search; that original native `ChooseCardsPrompt` selected the same `Garbodor BKP` printing in both candidate arms.

The single unpaired source deal is `6:3:B`, seed `861838028`, with an authentically different source physical SHA due to different setup shuffle/mulligan events. Its two arms remain present in the unconditional 32-game census and cannot be merged into an equivalent source first turn.

This evidence confirms **observed first-turn action-and-target identity in 15 physically aligned source pairs**, strengthening the earlier root-label-only comparisons. It does not establish identical candidate private cards, identical entire games, strong human source decisions, more than one unpaired rank6 opportunity, final match-clock compliance or competitive results.

## Executable verification

- [Posthoc original archive audit entrypoint](../../scripts/agent8-audit-registered-source-pairs.cjs) verifies the source registration Git blob and engine pin, then emits both source-deal and first-turn physical-recipient proof receipts. It uses no new game or policy randomness.
- [Source-deal integrity tests](../../tests/agent8-prospective-source-deal-audit.test.cjs) have five synthetic adversarial cases (tampered registration/seed, false native pair flags, missing evidence, mismatched actual starter and real source mismatch).
- [Source-first-turn recipients tests](../../tests/agent8-source-firstturn-physical-recipients.test.cjs) have six cases (different Bench target despite same root label, altered public delta/prompt choice, Store rejection, missing evidence and genuine source mismatch).
- [Exact rank11 first-eight location tests](../../tests/aichi-rank11-direct-opening-probability.test.cjs) retain five independent mathematical regressions.
- The existing [manual archive audit workflow](../../.github/workflows/aichi-rank11-artifact-audit.yml) gained the explicitly selected `canonical-20261029-source-pairs` option. It downloads the immutable 29 October 32-arm ZIP, then executes the three pure test suites and exact original archive integrity assertions. It runs no Twinleaf match or compilation.

[**Successful compiled archive audit CI 40937800563**](https://github.com/FlareZ123/experiment-01/actions/runs/40937800563) executed all **16/16 Node tests PASS** and printed:

```text
AGENT8_ORIGINAL_SOURCE_PAIR_AUDIT_PASS {"registered":16,"matched":15,"unmatched":1,"sameNativeFirstTurn":15,"observedTargetActions":11,"competitiveQualified":0}
```

A first attempted run [40937674474](https://github.com/FlareZ123/experiment-01/actions/runs/40937674474) failed before testing because the legacy download step collided with the new same-named archive extraction. The conditional was fixed in [commit f32033e](https://github.com/FlareZ123/experiment-01/commit/f32033ecce2560ddc9353d4086570e4cb8d01f5b), and the next run passed; no observed gameplay result changed.

**Research conclusion:** candidate treatment exposure should be qualified at the level of actual **source-deal and accepted target geometry**, preserving both candidate A/B outcomes but counting one common source opening per correctly paired cell. A matching source opening is still only a small part of competitive game-policy parity. The fixed-deck benchmark remains **29/32 exact opponent 60s and zero competitively qualified games; no 99.5% result.**
