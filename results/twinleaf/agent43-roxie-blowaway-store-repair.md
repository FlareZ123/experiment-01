# Rank-31 Roxie → Koffing: pinned Store effect-type repair and optional-damage policy gap

**Agent 43, 18 October 2026.** Evidence class: staged real-Store effect/action contract, **not a source-dealt complete game or competitive outcome**.

## Source and predeclared falsification

Published Aichi rank 31 (Yuhi Yokoyama, Dusknoir/Chimecho) includes **4 Roxie CEC 205** and **3 Koffing CEC 76**, confirmed in [the source 60](../aichi-2026/full-decklists.json). The [official Koffing printing](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/sm12/76) makes Blow-Away Bomb optional after discarding Koffing with Roxie: place one damage counter on each opposing Pokémon. Source-card use requires correct Roxie discard, draw and optional confirmation, not an invented unconditional spread.

The previously committed [staged Store test](../../simulation/twinleaf/agent43-roxie-koffing-confirmation.cjs) failed in [manual CI 38853335808](https://github.com/FlareZ123/experiment-01/actions/runs/38853335808) with `Cannot read properties of undefined (reading 'startsWith')` in `auto-log.js`. The pinned `blow-away-bomb.ts` constructs `DiscardCardsEffect` with `Object.create(DiscardCardsEffect.prototype)`, bypassing the TypeScript class-field initializer for `type`; `logPreventedEffect` then calls `effect.type.startsWith(...)`. This is a source-code diagnosis of a type-contract defect, not proof of incorrect paper card text.

I reused the repository's existing, reversible [Roxie discard type hook](../../simulation/twinleaf/roxie-discard-type-hook.cjs), which sets the actual `AttackEffects.DISCARD_CARD_EFFECT` only for the expected malformed pinned source effect. The staged test now executes both confirmation branches under that hook. This keeps the vendor submodule unchanged, fails closed if the upstream signature changes, and restores the original export after each synchronous run.

## Actual pinned Store result

**[Manually dispatched CI 39084076746](https://github.com/FlareZ123/experiment-01/actions/runs/39084076746) passed**, head `82972dd03a5278227ac455b9c60dce92186dde89`, Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The workflow installed and compiled the pinned engine, passed 20 pure evolution-related tests, passed the Shadow Rider evolution Store dispatches, executed the repaired Koffing/Roxie Store fixture, then completed the bounded four-trial rank-10 evolution diagnostic.

| Actual tested branch | Roxie discarded Koffing | Drew at least three | Opponent Active damage | Opponent Bench damage |
| --- | --- | --- | ---: | ---: |
| Generic `ConfirmPromptResolver` default declines | Yes | Yes | 0 | 0 |
| Deliberate optional confirmation accepted | Yes | Yes | 10 | 10 |

Both branches use real `PlayCardAction` and `ResolvePromptAction` on newly staged `Store` instances containing two opposing Pokémon. The pinned generic bot returns `false` on this optional confirmation. A `true` response produces ten damage to each target, as printed. This demonstrates that **the generic confirmation policy can forgo a legally available beneficial spread effect** in this specific valid board; it does not demonstrate how frequently the prompt occurs in source-dealt games or whether the affected match is won or lost. Opposing immunity, lock state, and other choices were excluded from the synthetic state.

The concurrently rerun source-mapped rank-1 versus rank-10 Shadow Rider evolution contrast, two seeds and two physical seats, produced zero opt-in evolution proposals across its four bounded games. Its unchanged 0/4/5/0 Shadow Rider attack counts per respective physical seat make it a *negative activation observation*, not evidence that evolution-target preference is generally irrelevant.

## Remaining qualification

- Run a **natural rank-31 source-dealt** match and record whether a Roxie/Koffing confirmation becomes legally reachable. A forced `true` branch is a policy counterfactual, not a natural game.
- Build a **prompt-specific** information-set-safe bot decision with regression evidence that it never activates for unrelated confirmations, and separately show a consequential opposing response. The generic `WANT_TO_USE_ABILITY` prompt alone cannot be presumed to uniquely identify Koffing.
- Confirm card-printing identity and all relevant Ability-lock/immunity states at the exact confirmation turn; measure any terminal or Prize difference under otherwise matched conditions.
- Retain the `zero qualified games` / `29 of 32 field lists` benchmark status. Do not promote this staged result into a win-rate claim.

A prior staged-test failure was repaired using a project-owned hook; the pinned vendor remains unchanged. The pass establishes *one correct mechanism path and one bot-policy gap*, not the 99.5% objective.
