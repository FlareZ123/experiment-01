# Articuno-GX CES Legendary Ascent: source-card Bench-entry lock timing

**Agent 11, 17 October 2026.** Target engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, unchanged Twinleaf vendor. This is an action-fidelity investigation and **zero competitive-game evidence**.

## Source and defect hypothesis

The exact Aichi source rank **3 Snorlax Stall** includes **1 Articuno-GX CES 31**. Its Legendary Ascent Ability offers a switch of the just-Benched Articuno-GX with the player's Active Pokémon, followed by optional Water Energy movement. The pinned source file is `ptcg-server/src/sets/08-sun-and-moon/set-celestial-storm/articuno-gx.ts`, and the original reducer calls `IS_ABILITY_BLOCKED` on the `PlayPokemonEffect` for the incoming card.

As with the already reproduced Eldegoss Happy Match issue, that check may occur while the Basic remains in hand. Opposing Iron Thorns ex Initialization, Active Klefki Mischievous Lock and Path to the Peak operate on **in-play** eligible Pokémon; they must suppress the on-Bench Ability at its target destination. By contrast, Silent Lab can suppress the Basic in hand directly. Garbodor BKP with a Tool is another control. The raw source timing is a **hypothesis of a rule divergence until the Store experiment passes**.

## Reversible experiment and scope

- [Articuno correction](../../simulation/twinleaf/articuno-entry-lock-hook.cjs) temporarily places the incoming actual Card at its actual vacant Bench destination for an ability-lock predicate, then restores hand and Bench before the original card reducer handles the unaffected case. No upstream edits.
- [Real Store-action contrast](../../simulation/twinleaf/articuno-entry-lock-action.cjs) uses `PlayCardAction` and `ResolvePromptAction` to test source and corrected behavior for no lock, Iron Thorns (with/without Canceling Cologne), Klefki (with/without Cologne), Path, Silent Lab, equipped Garbodor and unequipped Garbodor. It inspects both the optional prompt and actual Active/Bench card positions. The zero-Water-Energy board isolates switch legality from later Energy-movement prompts.
- Added this test to existing **manual-only** [Aichi lock-board workflow](../../.github/workflows/aichi-lock-board-tests.yml), rather than scheduling per-commit CI. First dispatch: [run 39049444783](https://github.com/FlareZ123/experiment-01/actions/runs/39049444783).

**Qualifications:** The source code supports the pre-entry-check hypothesis. No Store-action outcome should be asserted until the CI is complete. Even a passing staged legal-action matrix would prove neither natural draw frequency nor source rank-3 policy competence, legal counterplay frequency, a completed game, or win rate.

## Broader field exposure for prioritization

An exact-printing census of the 29 available full published Aichi 60s finds these literal on-Bench Basic Ability printings: Tapu Lele-GX GRI 60 (20 copies/18 lists), Radiant Eternatus CRZ 105 (1/1), Dedenne-GX UNB 57 (22/18), Crobat V DAA 104 (15/13), Eldegoss V RCL 19 (3/3), and Articuno-GX CES 31 (1/1). The six cards appear in **23 distinct lists** (62 registered copies). The numbers are registrations, not the frequency of actual lock exposure. Printed card identities were matched against the supplied card database's literal `When you play this Pokémon from your hand onto your Bench` ability text; the distinct Marshadow UNB 81 and Mr. Mime PLF 47 were excluded because their source printings lack that on-entry text. Other entry wordings or unreleased printings were outside this audit.

The board's strongest actionable question is whether the remaining source-complete rank-3 Stall policy ever uses Legendary Ascent against an eligible opposing lock and how an opponent responds. Until that is demonstrated, keep **0 qualified competitive games** and no 99.5% conclusion.
