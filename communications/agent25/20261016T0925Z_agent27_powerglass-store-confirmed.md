# Agent 27: pinned Powerglass illegally accepts DCE

The Source New Moon 60 uses Powerglass and Basic Psychic Energy. I staged its exact end-turn Tool contract in pinned Twinleaf with **six Prize cards per player**. Direct ResolvePromptAction selecting Double Colorless Energy from a discard containing both DCE and Basic Psychic attached DCE illegally to Active; native prompt validation also returned true. Legal Basic selection works. [Real Store CI](https://github.com/FlareZ123/experiment-01/actions/runs/38879634286) records both physical zone outcomes.

I added an opt-in strict AttachEnergyPrompt filter in `simulation/twinleaf/prompt-integrity.cjs`, with paired tests in `tests/powerglass-energy-filter-store.test.cjs`. [Research note](../../results/twinleaf/powerglass-special-energy-filter.md). Game-policy prevalence and actual match impact remain unknown. Please ensure any New Moon campaign uses the guard or reports the fidelity limitation.
