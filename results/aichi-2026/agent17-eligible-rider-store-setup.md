# Agent 17: eligible Shadow Rider opening policy verified in actual pinned Store

**16 October 2026. Evidence class:** reproducible, deterministic, **legal-deck setup-phase contract** in the compiled pinned Twinleaf engine. This is not a random opening-rate estimate or complete-game result.

## Source and execution

- [Passing CI 38869120100](https://github.com/FlareZ123/experiment-01/actions/runs/38869120100), fixed research source including [the runnable fixture](../../simulation/twinleaf/active-opening-pivot-live.cjs) and [manual workflow](../../.github/workflows/aichi-opening-pivot-eligible-live.yml). The pinned submodule is `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The scenario loads exact paper Aichi source inventories for **rank 1 Champion Shadow Rider Calyrex** and **rank 10 Regidrago** from `full-decklists.json` and resolves them to the full 60-card pinned-engine identifiers. It uses ordinary engine `AddPlayerAction`, `ShuffleDeckPrompt`, `SimpleTacticsAi`, `ChooseCardsPrompt`, `ResolvePromptAction` and `Store.dispatch` setup placement. Both sides complete setup, reaching the explicit first-turn DRAW phase in this pinned engine. No vendor code was edited.
- Only the seven-card candidate opening is deliberately ordered for an **eligible** case: `Latias ex SSP`, `Shadow Rider Calyrex V CRE`, `Trevenant & Dusknoir-GX SMP`, two `Lillie's Determination M1L`, `Carmine TWM`, `Iono PAL`. The opponent's shuffle uses a fixed identity permutation. This is a *constructed test*; it is not representative of a naturally shuffled hand, so the result carries no frequency or win-rate interpretation.

## Real setup outcome

| Treatment | Source seven-card hand | Bot's chosen starting Pokémon, ordered | Actually placed Active | Actually placed Bench |
| --- | --- | --- | --- | --- |
| Upstream default | Identical | Latias ex; Shadow Rider V; Trevenant & Dusknoir-GX | **Latias ex** | Shadow Rider V; Trevenant & Dusknoir-GX |
| `shadowRiderOpeningPivot=true` | Identical | Shadow Rider V; Latias ex; Trevenant & Dusknoir-GX | **Shadow Rider Calyrex V** | Latias ex; Trevenant & Dusknoir-GX |

Both versions resolved six engine setup prompts. The code verifies `ChooseCardsPrompt.validate()`, equality of the selected Pokémon multisets and full original hands, and that the engine's actual Active equals the first chosen Pokémon. The fixture now also fails closed if the pinned default selects another Active or if the experiment fails to move Shadow Rider into Active.

This establishes the **positive mechanistic contract** missing from [the same-commit rank10 six-trial no-op experiment](agent17-rank10-v3-opening-pivot-contrast.md). In that earlier experiment, the hook never triggered because all six recorded candidate seven-card starting hands lacked Shadow Rider V. The two findings are consistent: the policy works in an eligible game-state, while those specific natural no-V openings are ineligible. Neither report says how often it would help an actual human or competitive bot.

## Follow-up

The next candidate-quality experiment should use a *prospectively fixed seed schedule* with actual chosen Rider in the opening, then compare subsequent gameplay with the same opponent policies and a complete action-and-prompt replay. A different research branch, such as the [Latias attack-ready Energy tactic](../../simulation/twinleaf/latias-attack-ready-attach.cjs), is separately relevant to a Temple second-seat 0-attack game which had Active Latias with 2 Psychic and later expended a third Psychic elsewhere. That branch needs its own frozen-policy experiment.

**No competitively qualified field wins or 99.5% evidence.**
