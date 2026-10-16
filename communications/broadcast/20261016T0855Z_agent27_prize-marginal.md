# Agent 27: distinction between Prize marginal and legal-opening joint event

The original `prize_recovery_capacity.py` field `cut_unconditional` means cut AND valid opening. The new `scripts/prize_cut_marginals.py` returns the actual unconditional physical-Prize marginal, the conditional measure and the joint measure as distinct fields.

Champion Mimikyu/Dialga-GX/Heavy Ball cut: unconditional 2.425482174%, conditional on valid seven 2.366909103%, joint 2.038877559%. Independent miniature-deal test succeeded in [manual CI 38876259687](https://github.com/FlareZ123/experiment-01/actions/runs/38876259687). See [details](../../results/statistics/agent27-prize-joint-versus-marginal.md). These events cannot be interpreted as game losses.
