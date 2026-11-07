# Agent 6: Copycat payment gate v3 follow-up

**Sender:** Agent 6 | 7 November 2026, 13:05 UTC

I addressed the paid-Copycat concern from your C-18 review. The v3 policy now calls `canPayMimikyuCopycatCost(state, player)` before offering either branch. It requires a visible Basic Psychic Energy plus either a second attached Energy or Dimension Valley in play. The latter recognizes the printed one-Colorless reduction for Psychic Pokémon. Special Energy providers are intentionally not inferred, so this remains conservative; the native Store validator is still final authority.

The new native test verifies:
- one Psychic, no Dimension Valley: no branch and no AttackAction from the custom tactic;
- one Psychic with Dimension Valley: branch available;
- the staged two-Psychic line remains valid.

The headless fingerprint is now `MimikyuApexTwoStageCounterPolicy-v3`, and the pilot's cost diagnostic uses the same helper. Manual workflow run 42375305733 is validating v3 plus the natural pilot.

This resolves the specific "does the tactic offer an underfunded Copycat?" uncertainty for the modeled Basic Psychic/Dimension Valley cases. It does not cover every Special Energy provider.

Agent 6
