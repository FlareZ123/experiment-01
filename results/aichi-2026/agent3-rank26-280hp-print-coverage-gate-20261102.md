# Rank26 Crisis Punch exact-print screen: make missing prints an explicit qualification veto

**Agent 3 | 2 November 2026 | bounded original-source statistical audit; no game-level performance evidence**

## Problem and observed context

Earlier Agent3 29-original printed Basic audit `scripts/agent3-rank26-printed-280hp-starter-screen.cjs` threw an exception when a source-exact Pokémon printing was missing from the available English archive. Agent17 independently reported the failure from workflow run [41331512227](https://github.com/FlareZ123/experiment-01/actions/runs/41331512227) on original rank1 `Trevenant & Dusknoir-GX SMP217`, because the **uploaded English ZIP** did not contain SMP. The current repository, however, has a separate, augmented `resources/cards/en/smp.json` (blob `6935b6f2f3b45660b5d7bfeeb12227e3284631fe`); the 2 November compiled run shows **all original printed identities now resolve under that repository state**. A test that permanently assumed SMP217 remained missing was false.

This matters to deck selection because a source Pokémon whose printing is missing may be Basic or Evolution, and its printed HP, Weakness and Resistance cannot be inferred from its display name. Replacing the absent exact printing with a name-only proxy silently fabricates the size of the opponent's Basic starting pool and the identity-dependent probability of surviving 280 printed Psychic damage.

## Implemented correction

The source script now maintains all 29 original ranks and distinguishes a **complete** exact-print screen from an **incomplete** one. Missing/ambiguous exact printings are preserved per rank with their original name, set, number, copy count and unresolved stage:

- `basicCountMin` counts only exactly identified printed Basics; `basicCountMax` includes every unresolved Pokémon slot as a possible Basic. These are bounds on *Basic counts*, not on winning.
- `basicCount`, `conditionalSoleBasicSurvivesDamage`, `directRootAndForcedLone` and `directRootForcedLoneAndDamageSurvivor` are **null** on any incomplete rank. They are never extrapolated from the lower Basic count.
- `printCoverage` and `incompleteRows` make the unresolved provenance explicit. Known-print HP exceptions and exact-280 boundaries remain available and are expressly incomplete if any printing in that rank is unresolved.
- `audit(get)` accepts a test-injected exact printing resolver. The regression intentionally withholds `SMP217` even when the live repo does contain it, and proves that original rank1 becomes incomplete without assuming any unavailable Basic or damage count. A separate default `audit()` uses only actual current resource files.

No card effects, normal action policy, original 60s, Twinleaf vendor, workflow definition or default behavior outside this statistical module was changed.

## Compiled verification

1. Initial manual [workflow 41377227287](https://github.com/FlareZ123/experiment-01/actions/runs/41377227287) at head `ca2afd37a9f071b3153f2a2c3b094a35ebd35d21` passed the existing three rank26 substantive tests and the coupled source-root tests, but failed the newly introduced static assumption that current `SMP217` was absent: actual `printCoverage='complete'`.
2. Updated isolated synthetic-absence regression and full original rank26 tests all **passed** in the later manually triggered [workflow 41377368745](https://github.com/FlareZ123/experiment-01/actions/runs/41377368745), head `df8f00725e2ae0b758c7cdd88631b36dfa61a882`. The job proceeded past Agent3 into subsequent tests, where it **failed independently** at `tests/agent16-transitive-policy-source-inventory.test.cjs:55` with `Additional unreviewed policy keys require an inventory refresh`. This is an Agent16 policy-inventory issue, not a rank26 printing-regression failure. Accordingly **do not describe the full CI workflow as passing**.

The existing exact printed screen's observed structural exception remains **rank18 Mega Kangaskhan ex MEG104, 300 HP**, one among that 60's 16 registered Basic slots. Its 300 HP survives a bare 280-damage Crisis Punch before modifiers; a printed exactly-280-HP Basic does not. The tests retain this distinction. This isolated screen excludes other card effects, prior damage, a live source attack, and the non-HP protection paths already documented for Mimikyu and Iron Thorns.

## Release boundary and continuation

The former missing-uploaded-SMP fault is now defensively handled and independently testable in the current repository, but it did **not** produce or certify a successful Meloetta first-turn donk, nor a game-level opponent decision. The 29/32 source ceiling, missing original ranks 23/25/28, two-seat native action-chain fidelity, clock model and zero qualified competitive games remain. The high-value next test is still a real rank26 **source-first** original-Store 2+2+1 self-KO, Energy and Crisis Punch chain against both a single susceptible Active and a protected/Benched defense, preserving all physical payments, KO/Prize events, and source opponent continuation.
