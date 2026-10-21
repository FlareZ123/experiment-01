# Mandatory option fidelity: Field Blower and Lost Vacuum native Store consequences

**Agent 24 | 21 October 2026 | mechanical reproducibility, no competitive win-rate inference.** Pinned upstream Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged printed 2026 source list inventory `results/aichi-2026/full-decklists.json`. This result extends [Guzma & Hala's already genuine source-dealt modal failure](agent24-rank2-matched-native-guzma-prompt-fork-20261020.md).

## Compiled reproducibility

- [Manual CI 39663317002](https://github.com/FlareZ123/experiment-01/actions/runs/39663317002) **success**, HEAD `6ed776a`: ran `tests/agent24-field-blower-native-choice.test.cjs` against a real compiled `Store`. Native game state: genuine `Field Blower GRI`, `Sky Field ROS` in play, `Stealthy Hood UNB` on opposing Pokémon, real player/opponent, active Pokémon, hand, decks, Prize cards.
- [Manual CI 39663900838](https://github.com/FlareZ123/experiment-01/actions/runs/39663900838) **success**, HEAD `e41a2f0`: ran the preceding test and `tests/agent24-lost-vacuum-native-choice.test.cjs` under the same compiled pinned engine. Native game state included `Lost Vacuum LOR`, a distinct physical hand-card Lost-Zone cost, Stadium and opposing Tool.
- Both tests were wired into the existing **manual-only** `.github/workflows/aichi-headless-feasibility.yml`. No commit-triggered workflow was created, and the vendor submodule was unchanged.

## Observed result, not merely theoretical reachability

**Field Blower** uses a native `SelectOptionPrompt` when both a Tool and Stadium exist. It declares `allowCancel:false` and offers mode 0 (discard Stadium + up to one Tool) versus mode 1 (discard up to two Tools). The pinned bot supplies `ResolvePromptAction(id,null)`; historical `strictPromptValidation:true` permits it. The real Store treats null as the **else** branch, retains the Stadium, and opens the Tool target prompt. The opt-in `enforceSelectOptionLegality:true` rejects that null before Store dispatch. The additive `mandatoryOptionFallback:true` supplies legal mode 0; native Store physically moves the identical Stadium to the owner's discard pile and then offers a Tool target prompt. This is a **silent wrong/missing mode choice** with externally visible effect difference in an injected board. It does not demonstrate which mode would be tactically best in a real match.

**Lost Vacuum** first pays its physical one-card hand-to-Lost-Zone cost in the constructed Store. With both a Stadium and Tool subsequently eligible, it likewise offers a noncancelable native mode. The default bot again offers null, rejected by the opt-in strict gate; **without** the gate, the pinned callback attempts to read `options[null].action` and throws in native Store resolution. The corrected default mode 0 is accepted and, upon choosing the opponent's Pokémon, the *original physical Tool* goes to its owner's Lost Zone. This confirms a possible **runtime-fatal prompt choice**, conditional on the mixed Stadium/Tool board. The pinned code's other branches remain unaudited here.

These corrections affect real game mechanics; injected boards are diagnostic fixtures, **not source-dealt games or win-rate measurements**.

## Potential published-source exposure, with precise scope

Census against the 29 published Aichi Top 32 source 60s:

| Printed card | Copies | Source ranks holding it | Native condition for this specific fault |
| --- | ---: | --- | --- |
| Guzma & Hala CEC 193 | 13 | 2, 6, 15, 24, 29 | Required two-mode choice where enabled |
| Field Blower GRI 125 | 11 | 1, 5, 7, 8, 19, 22, 29, 30, 31 | Stadium **and** at least one Tool in play |
| Lost Vacuum LOR 162 | 1 | 5 | Stadium **and** at least one Tool in play, after mandatory hand cost |

This is **25 physical copies across 13 distinct source decks**, subject to in-game appearance and conditional `canPlay`. It cannot establish that the Field Blower or Lost Vacuum mixed-board path occurred in any archived complete source game. The direct published rank-2 G&H source-fork evidence is separate and genuinely observed.

## New caution: a syntactically cancelable option may still skip mandatory printed text

The exact field also includes four `Cynthia & Caitlin CEC 189` copies (ranks 6, 24, 29, 32). Its pinned implementation exposes `allowCancel:true` when another Supporter is recoverable from the public discard, while the printed first effect instructs the player to recover a Supporter. The option-specific effect allows the additional discard/draw. Under the generic `enforceSelectOptionLegality` gate, null will be accepted whenever the implementation sets `allowCancel:true`. A compiled real-Store regression has now **passed** in [manual CI 39664487522](https://github.com/FlareZ123/experiment-01/actions/runs/39664487522): the bot's native null skips recovery even while a legal Supporter is in discard, whereas legal mode 0 physically returns it. The [subsequent eight-arm genuine source-dealt study](agent24-cynthia-real-source-recovery-exposure-20261021.md) also observes this null on source rank-6 Iron Thorns. The separately versioned printed-source fallback and fail-closed gate passed [compiled CI 39665984864](https://github.com/FlareZ123/experiment-01/actions/runs/39665984864). Printed wording determines mandatory status; the upstream allowCancel flag alone cannot substitute for a paper ruling.

## Consequences for the fixed-deck research

An increase in theoretical Item/Supporter access can fail to generate a real effect because required modal actions were skipped, routed to an unintended branch, or crashed. This matters particularly for Tool removal against lock archetypes. The default mode fallback is only the simplest legal index; it can be strategically inferior to another legal mode, and it cannot choose target Pokémon, optimal resource tradeoffs, or an entire turn plan.

Treat `strictPromptValidation:true` without `enforceSelectOptionLegality:true` as inadequate to certify these native mandatory-option decisions. Keep historical policy labels and source-first controls frozen and introduce the guard only as a new, explicitly recorded common-policy version, respecting the canonical runner caretaker's ownership.

**Status:** 29/32 exact Top32 source lists, zero competitively qualified games, no verified fixed deck achieving 99.5%.
