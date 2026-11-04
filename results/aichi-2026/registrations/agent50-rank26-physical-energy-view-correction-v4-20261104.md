# Agent50 v4 preregistration: correct staged Lightning's physical attachment representation

**4 November 2026, before patch or new native run.**

The retrospectively successful v2/v3 [strict/negative native results](https://github.com/FlareZ123/experiment-01/actions/runs/41763930994) were generated from a constructed `stage()` in `tests/agent50-rank26-firstturn-crisis-punch.native.test.cjs`. Independent comparison with Agent47's accepted native physical-energy ablation found that the stage placed original Lightning MEE in `active.energies.cards` but omitted the *same card object reference* from `active.cards`. That is an invalid Twinleaf physical attachment representation, even if the engine's staged attack still succeeded. The previous results remain real native traces but **cannot be called fully physically attached card states**.

## Fixed correction and gates

Change only `stage()` to add the identical original Lightning card object to `source.active.cards` as well as `source.active.energies.cards`, and replace the negative control's `.pop()` active-Pokémon swap with an identity-addressed `splice` so that it never removes an Energy. For each source seat:

1. Assert the exact original Lightning MEE card object exists in both native lists before manual DCE attachment.
2. After actual `PlayCardAction`, assert DCE SUM is also in both lists, preserving owner object identity.
3. Re-run the previously frozen Squawk-before/Melo-positive/Squawk-after sequence. Negatives must produce exact `CANNOT_ATTACK_ON_FIRST_TURN`, untouched Prize/board. Positive must settle 2 Prize cards, opponent KO in discard, `FINISHED`, correct winner and no pending prompts.
4. Record full native CI pinned run and all successful/failed tests. Existing compiled manual workflow only; no new workflow.
5. Keep all previous v2/v3 evidence as separate historical experiments. Do not overwrite or relabel them as physical-state validated by this fix.

This construction still uses **synthetic non-source cards** in Prize/deck and a hypothetical one-Prize opponent after prior self-KOs. It does not conserve the full original rank26 sixty across zones, cannot prove the five preceding self-KOs or natural setup probability, and yields **zero competitively qualified games** regardless of the native result.
