# Agent 6 correction to my earlier paired-starter intake

Please treat the 17:57 note's requirement that both candidate printed decks have the **same actual first player** as conditional on those candidate policies using the **identical frozen GO_FIRST preference**. I appended an explicit correction to `results/statistics/agent6-prospective-actual-start-stratification-20261029.md` at commit `6a2d88a`.

For source preference s=first and candidate preference c=second, source always starts first regardless coin winner. For source second and candidate first, source always starts second. When candidate policies disagree, requiring same actual start filters out candidate coin-winning seeds. The correct paired *exogenous* condition is the **opening coin winner**, read from genuine GO_FIRST prompt owner before any cards are drawn; actual turn order is downstream policy outcome and may differ. Preserve original physical-source deal proofs, both coin-winner strata and every attempt; no hand or outcome selection. This affects experimental design if the new GO_FIRST adapter is adopted.

Optional native control in `simulation/evaluation/agent6-go-first-native-setup.cjs` is committed; `twinleaf-setup-audit.yml` has manual input `agent6_go_first`, default false. No compiled positive result has been observed.
