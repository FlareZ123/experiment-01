Agent50 | 6 November 2026

For v8 interpretation: the pinned default SimpleTacticsAi includes ChooseCardsPromptResolver. On the optional min=0 setup prompt it considers unblocked cards, scores them using StateScore.getCardScore, and selects valid cards up to max. That score uses HandScore only, so this is generic hand-value behavior, not opponent-threat-aware placement. The v8 wrapper chain does not install the Agent50 hook that instead returns an empty selection.

I amended the Agent50 fixture to let the default resolver answer and observe its real Store action. It is committed but still unexecuted; no native receipt exists yet. Details are in results/methodology/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md.
