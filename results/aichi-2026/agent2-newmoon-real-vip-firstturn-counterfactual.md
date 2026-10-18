# Rank-11 New Moon first-turn VIP counterfactual, authentic source seed

**Agent 2, 18 October 2026.** New, real Store-action policy failure established on one **retrospectively selected** source-dealt candidate-first opening. Full compiled [manual CI 39139845365](https://github.com/FlareZ123/experiment-01/actions/runs/39139845365) **passed** (source head `581d0f29e505c2eca64f5abe3785d0e3c9e452de`, pinned Twinleaf); archive artifact `12141247395`. The independent [artifact audit 39140195743](https://github.com/FlareZ123/experiment-01/actions/runs/39140195743) **passed**, printing the actual archived counterfactual selections. [Runner](../../simulation/twinleaf/rank11-newmoon-first-vip-counterfactual.cjs), shared [manual workflow](../../.github/workflows/rank11-direct-boostshake.yml), [archived replay reader workflow](../../.github/workflows/aichi-rank11-artifact-audit.yml).

## Original source information set

Against exact published rank-11 Wataru Yano Absol Garbodor, original New Moon Lockbreaker **English mechanics proxy 60** was placed in physical seat 1, with seed **2809154458**. Live draw log verifies candidate **actually first**. The original first owner-decision state was independently captured in baseline and counterfactual and asserted structurally identical:

- **Active:** Unown AOR.
- **Bench:** Galarian Articuno V CRE, Unown AOR, Unown AOR, then two vacant positions.
- **Hand:** Battle VIP Pass FST, Psychic Energy MEE, Battle VIP Pass FST, Fog Crystal CRE, Psychic Energy MEE, Rescue Carrier EVS.

The unmodified bot previously attached Psychic Energy to Articuno V and **passed** turn 1, retaining both Battle VIP Pass. The source-backed pass diagnosis and its context are in [this prior report](agent2-rank11-candidate-first-pass-diagnosis.md).

## Matched single-policy intervention

The opt-in research adapter uses only the acting player's own hand and public board before choosing to play the existing physical Battle VIP Pass. It invokes `SimpleTacticsAi.isValidAction` against the authentic Store, dispatches an ordinary `PlayCardAction`, and reads the owner-only deck contents **only after** the real `ChooseCardsPrompt` has exposed that deck to the acting player. It does not fabricate, move or clone the wanted physical cards into play; the action and selected physical search cards pass the Store's real validation and dispatch.

The successfully compiled and archived outcome for the **same unchanged original deal**:

1. Legal-action check: `source-first-turn-VIP-check.valid=true`, global turn **1**.
2. Actual Item: `PlayCardAction` for Battle VIP Pass, then a real `ResolvePromptAction`.
3. True owner-deck prompt selection: **Mewtwo & Mew-GX UNM** and **Gengar & Mimikyu-GX TEU**.
4. Public Bench after selection: Galarian Articuno V CRE, Unown AOR, Unown AOR, **Mewtwo & Mew-GX UNM**, **Gengar & Mimikyu-GX TEU**.
5. Both baseline and intervention proceeded to attach a Psychic Energy and choose Pass on candidate turn 1. The intervention also showed Energy attachment then Pass on candidate global turn 3. This **does not** demonstrate an early attacking line or improvement in outcomes.

Thus the unmodified simulator's chosen Pass overlooked a **live, accessible, legal and setup-changing Item line** in this exact source game. This is stronger than inferring a missed card from hand counts alone. It is also narrower than proving the alternative improves game winning probability: the new Bench becomes full, may affect later lines, and still requires an attacker to move Active and Ability locks to be answered.

## Validation and limitations

- Exact decklists and physical seed held fixed; engine revision asserted, first-turn verified by draw-log, before-decision own-state equality asserted in runner.
- Tool-dependent rank-11 setup still comes from its existing opt-in legal Store actions, not synthetic lock injection. No card balance/legality hypothesis is introduced from the simulator alone.
- Source seed originally outcome-selected in a 128-trial screen; this is a **mechanical paired intervention** with one data point, without a prospective prevalence estimate. Entire wider field remains **29/32** exact 60s, 0 independently gameplay-qualified results. The candidate uses provisional English proxy printings.
- The accepted Item and Bench evidence **certify the particular policy's omitted setup action**; they cannot certify attack-resolution fidelity, response to Garbotoxin, tournament clock, optimized deck selection, or 99.5% game win rate.

## Next experiment

Extend the autonomous VIP setup policy to prospectively fixed, both-start, original-source 60s with all failed prompts and unsuccessful opportunities retained. Track legal first-turn setup opportunity exposure, actual Item use, subsequent Basic Pokémon resources, active-position choices, copied attack resolution and opponent re-lock. Compare to the unchanged generic bot on identical initial source deals and audit costs of filling the Bench. Prioritize *decision competence before deck-list superiority claims*.
