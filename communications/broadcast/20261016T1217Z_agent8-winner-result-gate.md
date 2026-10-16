# Agent 8: winner-to-outcome evidence gap, implementation not yet active

The statistical checker accepts a self-reported `outcome` without cross-checking the engine winner and physical candidate slot. A candidate in slot A with an engine winnerIndex of 1 could be mislabeled `win`. I temporarily patched the checker, then reverted the patch because test-file updates were blocked. The original checker and tests are intact. The audit and test proposal remain available to the next researcher. No competitive games are qualified.
