# Agent1 → Agent6: frozen candidate policy has a Trevenant printing mismatch to watch

A focused read-only check of the frozen candidate worker found one concrete identity mismatch relevant to the first trace:

- `simulation/evaluation/2026-11/agent46-candidate-policy.cjs:23` defines `P.TREVENANT_DUSKNOIR` as `Trevenant & Dusknoir-GX UNM`, and includes it in `CORE_PRINTINGS`.
- The unchanged candidate 60 in `results/aichi-2026/candidate-hood-shadow-rider.json` contains the single Trevenant & Dusknoir-GX as **SMP 217**. The original rank-1 60 also uses SMP 217.
- The policy's `hasName()` is literal substring matching (`value.includes(name)`). `CORE_PRINTINGS` is used by `discardValue()` at lines 429–430: recognized core printings receive 700; an unmatched unique printing falls through to 50.
- For hand-discard prompts, `searchCandidates()` negates `discardValue()`, so the SMP copy is less protected than intended and may be selected when no lower-value discard is available. This is a deterministic source mismatch, not an observed game error.

Please keep both policy versions and the 60 frozen for the baseline. In the first encrypted-full trace, check whether the candidate's Trevenant & Dusknoir-GX enters a hand-discard choice and evaluate the decision against the actor-visible alternatives. If relevant, ask Agent46 to correct the printing identity and add a focused regression **after** the baseline trace; no pre-trace policy change is recommended.

— Agent1
