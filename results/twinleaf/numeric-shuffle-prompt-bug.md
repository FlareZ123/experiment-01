# Pinned Twinleaf ShuffleDeckPrompt numeric permutation regression

**Agent 3, 17 October 2026. Evidence class: compiled source regression, not competitive-game evidence.**

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements [`ShuffleDeckPrompt.validate`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/shuffle-prompt.ts) by calling JavaScript `Array.prototype.sort()` without a comparator and subsequently comparing every element to the corresponding numeric index. Default `sort()` orders array members as strings. For deck sizes >= 11, **an ordinary legal index permutation is rejected**: an identity array `[0,1,2,...,11]` sorts as `[0,1,10,11,2,...,9]`. This is a directly source-supported validator defect.

The first compiled Klefki–Telepath trace exposed this when a valid deterministic 12-plus-card deck shuffle failed `prompt.validate`; [manual CI 39039371801](https://github.com/FlareZ123/experiment-01/actions/runs/39039371801), stage `Invalid deterministic shuffle`.

## Versioned, reversible research correction

- [Hook](../../simulation/twinleaf/numeric-shuffle-validation-hook.cjs) overrides only the `ShuffleDeckPrompt.prototype.validate` descriptor with integer `sort((a,b)=>a-b)` and validates array length, integer membership and exact permutation of `0..n-1`. Installer returns a function restoring the original property descriptor.
- [Tests](../../tests/numeric-shuffle-validation-hook.test.cjs) verify raw failure, acceptance of legitimate order/reverse order, rejection of shortened, duplicated, fractional and non-array sequences, restoration of raw failure, and owner resolution via `getPerspectivePlayerId`.
- [Manual New Moon workflow](../../.github/workflows/aichi-newmoon-source-coverage.yml) runs these compiled tests and the separate Klefki search/retreat witness. **[Run 39039679454](https://github.com/FlareZ123/experiment-01/actions/runs/39039679454)** passed both steps on 17 October, with [Klefki–Telepath artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39039679454/artifacts/12103900279).

**Scope caveat:** Pinned `Store.reducePrompt` currently assigns prompt results without invoking `prompt.validate`. Therefore this defect is directly demonstrated in the exposed validator, and in any caller that invokes it; this report makes **no claim that all uncorrected source matches reject shuffle actions**. The research-owned [strict prompt integrity gate](../../simulation/twinleaf/prompt-integrity.cjs) already bypasses the broken upstream shuffle validator, using an independently implemented numeric permutation check for `ShuffleDeckPrompt` and three other prompt types. That pre-existing gate reduces impact on headless runs that explicitly enable `strictPromptValidation:true`; the new hook is useful for independent native prompt tests and callers using `prompt.validate` directly.

No vendor modification or broad automatic enablement. A passing prompt regression does not certify full Twinleaf paper-Expanded fidelity, playable-policy competence, an authentic New Moon source deal, or any competitive win.
