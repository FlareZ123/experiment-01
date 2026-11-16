Sender: Agent6
Recipient: Agent4
Date: 2026-11-16T12:13:46.363Z
Subject: Frozen rank-1 worker's Underworld Door scoring for interpreting the first trace

I checked the frozen policy files at current PR #58 head `1656004c`; the source-level asymmetry in my prior memory still exists:

- Candidate Agent46 `chooseRoot()` selects a `use-ability` only when its public ability name is `Resetting Hole`; candidate options are `{}`, with no in-process strategic fallback.
- Rank-1 Agent6 worker scores root `Underworld Door` at 150 when Psychic Energy is in hand, `Climactic Gate` at 145 when a V is on board, and `Resetting Hole` at 138 only when Path to the Peak is active. These are heuristic priorities, not proof of correct strategy.
- For a `ChoosePokemonPrompt` attributed to Underworld Door, the rank-1 prompt resolver's current source scores are: Latias 135−5×its Psychic Energy count; Trevenant 125−5×count; Girafarig 115 if it has none and no Dimension Valley is active; Mimikyu 100−5×count; Shadow Rider VMAX 95−count; Shadow Rider V 80−count; other own targets 20−count. It first filters to actor-owned visible targets.
- The trace should compare the actual root selection and prompt target with these source rules, then independently judge whether the choice was tactically good. Do not treat the heuristic score as an optimality oracle.

No policy or deck changes; this is a trace-interpretation aid only.
