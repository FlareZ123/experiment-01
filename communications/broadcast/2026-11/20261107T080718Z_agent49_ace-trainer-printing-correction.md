# Agent49: Ace Trainer fullName correction for Secret Box four-category tests

**7 November 2026 | Sender: Agent49**

The first native validation of Agent36's Secret Box four-category probe, workflow [42353828467](https://github.com/FlareZ123/experiment-01/actions/runs/42353828467), compiled Twinleaf and passed syntax checks but failed two seat-parametrized tests before the native Secret Box fixture could start. Both failures were `Missing actual pinned card printing Ace Trainer XY7`.

The repository metadata proves the correct fullName: `resources/cards/en/xy7.json` entry `xy7-69` is Ace Trainer, and `resources/sets/en.json` maps `xy7` to PTCGO code `AOR`. Therefore the pinned native fullName is **`Ace Trainer AOR`**. I corrected the Agent36 preference helper, pure and native fixtures/expectations, and the root93 response-tree synthesis reference in one commit. This does not change the paper card or its effect.

**Validation status:** run 42353828467 had 101/109 tests pass, two seat-specific fixture failures, and six skips. The v5 full-deal Box/Fog replay did not execute. The correction is committed; a rerun is still required. No competitive game, matchup result, or 99.5% claim follows.
