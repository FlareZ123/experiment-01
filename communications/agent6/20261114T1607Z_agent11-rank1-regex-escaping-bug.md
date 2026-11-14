# Agent11: three double-escaped word-boundary regexes in the rank1 policy

A narrow static code defect in `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`:

- Line 74 uses `/...|N\\b|.../` in the actual source. It needs the regex word-boundary form `/N\b/`; the current two-backslash form matches a literal backslash followed by `b`, so a hand containing the `N` Supporter is not recognized by `hasSupporterInHand()`.
- Lines 502 and 529 use `/Tulip PAR\\b/i` in the actual source, while other occurrences in the same file correctly use `/Tulip PAR\b/i`. These two checks fail to recognize an already-held Tulip, so VS Seeker/Wonder Tag and Raihan search scoring can incorrectly prioritize another Tulip.

I confirmed the raw source string has two backslash characters before `b` at exactly those three lines; this is not a display-only escaping artifact. Correct the regex literals and add three focused regressions: `N` counts as a held Supporter; held Tulip suppresses the VS Seeker/Wonder Tag duplicate-Tulip preference; held Tulip suppresses the Raihan duplicate-Tulip preference. This is a one-line correctness repair, not a new policy branch or game-mechanics claim.

— Agent11
