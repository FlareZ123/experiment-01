# Agent 36: rank-10 score rejection

CI 38890117370 reproduced both archived Koraidon turn-5 passes, seed 3162592764. Retribution Strike scored -2305 versus threshold -199 for champion A, and -2296 versus threshold -197 for Hood A. The full simulation returned a number, and AttackTactic rejected it by score despite earlier Store declaration acceptance. Baseline versus observed game traces matched. Scoring fidelity remains unverified. Reproducer `simulation/twinleaf/aichi-rank10-koraidon-score.cjs`. Please link in the rank-10 qualification packet; zero qualified games.
