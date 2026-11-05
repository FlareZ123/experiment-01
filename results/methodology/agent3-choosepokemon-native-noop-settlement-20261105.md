# Owner ChoosePokemonPrompt native silent-no-op settlement gate

**Agent 3 | 5 November 2026, normal-mode continuation | source-proven and injected-Store regression; not a new competitive game.**

## Native failure mechanism

At pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/store.ts` dispatches `ResolvePromptAction` to `reducePrompt`. That reducer checks both the `state.prompts` entry and the matching internal `promptItems` entry. If either is missing, it returns the current state **without throwing**. A nonthrowing `Store.dispatch` therefore cannot independently certify native prompt resolution. On genuine resolution, the pinned reducer assigns `prompt.result = action.result` before callbacks or prompt removal.

Previously, `simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs` incremented `audit.accepted` immediately after `dispatch` returned and only subsequently updated `postconditionsConfirmed` or `postconditionsMissing`. A silent no-op would therefore be recorded as **accepted=1** and **postconditionsMissing=1**, which can mislead consumers of the aggregate `accepted` field.

## Narrow correction, provenance and tests

The corrected exact handler `agent8-actor-only-choose-pokemon-v2-resolved-settlement` at commit [`5eab77a`](https://github.com/FlareZ123/experiment-01/commit/5eab77a22f97f484debf5bd9f03ec0b6deb64f93) requires that the *same pending physical prompt object* have `result === action.result` after the native dispatch. An unset result now increments `postconditionsMissing`, throws an explicit unresolved-prompt error and **does not** increment `accepted`. Native exceptions continue to increment `rejected` separately. A normally resolved choice still increments `accepted` and `postconditionsConfirmed`.

The repository's existing both-seat mock tests remain present, and a new explicit both-seat silent-no-op regression was appended to [`tests/agent8-actor-only-choose-pokemon.test.cjs`](../../tests/agent8-actor-only-choose-pokemon.test.cjs) in commit [`ff24fbf`](https://github.com/FlareZ123/experiment-01/commit/ff24fbfda8524442faeaafe1a524114cfc75a8ed).

An independent direct V8 execution of the **exact fetched corrected source** with injected Node dependency shims ran four cases: seat 0 and seat 1 each under a resolving fake Store and a silent no-op Store. All four assertions passed:

| Physical seat | Store behavior | accepted | postconditionsConfirmed | postconditionsMissing | native-dispatch rejected |
| --- | --- | ---: | ---: | ---: | ---: |
| 0 | genuinely resolves prompt | 1 | 1 | 0 | 0 |
| 0 | silently returns unchanged | 0 | 0 | 1 | 0 |
| 1 | genuinely resolves prompt | 1 | 1 | 0 | 0 |
| 1 | silently returns unchanged | 0 | 0 | 1 | 0 |

The negative cases additionally verified that an unresolved-prompt error was thrown. These are **injected-Store unit tests**, with exact patched production source code executed in a V8 runtime. A fresh compiled pinned-Twinleaf CI run of the newly committed Node tests **has not yet been observed**; this is a remaining execution gate.

## Research significance and limits

The [previous v14 native report](agent3-v14-native-owner-pokemon-promotion-after-prize-aba-20261105.md) independently recorded one native `ChoosePokemonPrompt` intervention with `postconditionsConfirmed=1` alongside its `accepted=1`. The new fix addresses the broader aggregate accepted-counter interpretation. It does **not** prove that the historical v14 intervention was a silent no-op, invalidate its archived result retroactively, or improve its tactical first-eligible Pokémon decision policy. Exact prior archives should retain their v1 handler labels.

The new predicate establishes prompt consumption and the selected native response. For effects with downstream card custody, attacks, damage or Prize consequences, require their **own distinct physical effect checks**; a resolved ChoosePokemon prompt does not by itself prove strategic payoff or paper-game qualification. The other modal and Prize handlers still need independent gate review in the selected whole-policy closure.

**Competition admission remains unchanged:** 29 authenticated Top32 opponent name/count sixties, ranks 23/25/28 missing, zero competitively qualified games, no selected final 60, and no demonstrated 99.5% field win rate.
