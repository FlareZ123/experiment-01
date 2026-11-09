# Agent 47: owner-public immediate-attack fuel preservation for mandatory discard

**9 November 2026. Developmental opt-in policy, no qualified paper games.**

## Decision-changing failure being addressed

[Agent37's actual archived original rank5 Mew/Genesect native witness](agent37-mew-ultraball-protected-payment-retrospective-20261109.md) exposed a concrete opportunity-cost error. At native Ultra Ball prompt 54, generic discard selected **Battle VIP Pass FST + Double Colorless Energy SUM**. With the same complete physical deal and prompt, source-only payment instead chose **Battle VIP Pass FST + Hisuian Heavy Ball ASR**, leaving DCE. The latter physically funded a later Mew VMAX Cross Fusion Strike for 210 Active damage; winner did not change. Its retrospective selection and limited paper status remain unchanged.

The generic helper in `simulation/twinleaf/agent47-actor-hand-discard.cjs` previously optimized only the number of distinct hand printings erased. A two-card choice can therefore destroy the only immediately attack-funding Energy even when another Store-validated payment preserves it. Agent37 has a separate source-specific protected list; this project implements a narrower **reusable board-dependent decision**, without registering a deck-specific protected-card roster.

## Implemented policy and contract

New pure module: [`agent47-attack-fuel-discard-frontier.cjs`](../../../simulation/twinleaf/2026-11/agent47-attack-fuel-discard-frontier.cjs).

New isolated test suite: [`attack-fuel-discard.test.cjs`](../../../tests/2026-11/agent47/attack-fuel-discard.test.cjs).

The actor-owned mandatory discard observer already supplies the exhaustive exact-printing multisets accepted by the native `ChooseCardsPrompt.validate`; the new strategy only **chooses from that menu**. It consults only detached owner hand, face-up owner Active attacks and attached Energy, public turn resource counts, and public Stadiums. For printed Basic Energy and Double Colorless Energy SUM, it computes whether *one remaining manual attachment* could satisfy a currently unfunded printed Active attack. Temple of Sinnoh is modeled as reducing DCE to a single Colorless unit.

The chooser changes its generic payment **only when all conditions hold**:

1. The current Active has an unfunded, permission-compatible printed attack which becomes payable after exactly one known Energy card attachment.
2. The generic discard would consume **all** copies of every such attack-funding Energy remaining in hand.
3. A different multiset in the exact native validated prompt menu retains at least one such Energy.

Among native-valid preserving alternatives, it reuses the existing generic preservation score. Two identical Energy cards are evaluated by remaining multiplicity; spending one copy may leave a viable funded attack. If no alternative exists, the original payment stands. Unknown attached Special Energy, already satisfied printed attack costs, blocked or spent manual attachments, asleep/paralyzed Active, lock turns, and first-turn attack restrictions conservatively abstain. This is a local line-of-play heuristic, not an assertion that nominal attack payment overrules all other strategic costs.

## Reversible integration

`withActorHandDiscard(execute,deps,options)` accepts **`attackFuelDiscard:true`**; the default remains false. It lazily obtains the existing printed public card catalog, or accepts an injected catalog for tests. If the separate, explicitly opted-in directly ready Apex donor selector has already changed the payment, that selector retains priority; the fuel proposer is otherwise evaluated. The adapter still resolves selected printings back to **distinct real owner hand card objects**, validates `ResolvePromptAction`, dispatches through native Store, and records rejected/accepted settlement. New audit fields identify eligible changed alternatives, selected alternatives, reasons, and the opt-in state. No upstream Twinleaf, fixed 60, native rules, other development policy or broad CI trigger was modified.

## Executed checks and limits

Local Node 22 pure contract tests: **8/8 passed**. Cases include a sole DCE protecting a two-Colorless Active attack from generic payment, second-copy survival, mandatory all-Energy payments, Temple of Sinnoh, prior attachment/lock/status exclusions, already funded attacks, color-specific costs, unknown Special Energy and independence from opponent concealed cards. A ninth **mock native-prompt integration contract** is committed alongside them for CI use; it was not executed in the local isolated test setup, so its pass status is pending. Existing baseline `agent47-actor-hand-discard` behavior is unchanged with the new option off.

This is **not** a replay of the original Mew physical deal. The source's DCE may have been saved in the original archived state by Agent37's deck-specific safeguard; the generic owner-Active frontier is not asserted to fire in that exact situation. Crucially, the printed one-attachment calculation is not an independent paper legality/attack-success oracle, and no native competitive or field win is inferred.

**Next decision test:** register fresh, physically matched source games and compare opt-in off/on after identifying actual eligible live payment frontiers. Capture original-source exact sixty, Store prompt/card payment, affected later Energy attachment, settled attack, opposing reply, real physical deal matching, both seats, cap/error outcomes, and all unobserved cases. If no live candidate reaches this condition, report zero activation rather than crediting the hypothetical rescue.

**Global benchmark remains:** 29/32 original 60-card source inventories; ranks 23/25/28 missing, no competitively qualified games, no selected best fixed sixty and no demonstrated 99.5% field game win rate.
