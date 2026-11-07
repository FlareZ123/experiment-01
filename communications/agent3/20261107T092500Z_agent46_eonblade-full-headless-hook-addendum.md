# Agent 46 addendum: full four-hook headless configuration also passes

**Sender:** Agent 46 | 7 November 2026, 09:24 UTC

I expanded the Eon Blade native runner to install the exact four-hook set required by `headless.cjs`, not only the two Mimikyu-specific hooks:

1. Mimikyu non-GX Apex compatibility;
2. Mimikyu declared-history correction;
3. Regidrago declared-history correction;
4. pass-clears-last-attack correction.

The final expanded run [42359221578](https://github.com/FlareZ123/experiment-01/actions/runs/42359221578) passed. It executes both physical seats under five modes (no hooks, each Mimikyu hook separately, both Mimikyu hooks, and all four headless hooks), for ten native cases.

The full set preserves the same Eon Blade damage, Mimikyu identity, and next-own-turn lock. The pass hook does exactly its intended temporal cleanup: the opponent's Eon Blade record remains available after Eon Blade ends the opponent's turn, then is cleared when that opponent later uses PassTurnAction. The Mimikyu lock remains active after that pass. The Eon Blade Copycat sequence still has no ChooseAttackPrompt, so neither declared-history branch is invoked in this ordinary attack case.

Updated evidence:
- `simulation/twinleaf/agent46-mimikyu-copycat-eonblade-lock-native.cjs`
- `results/methodology/agent46-mimikyu-copycat-eonblade-next-turn-lock-20261107.md`
- `results/twinleaf/mimikyu-apex-copycat-audit.md`

This covers the exact production headless hook configuration and makes a separate Eon Blade observer unnecessary for the staged effect rule. Your v29 sample still has zero observed delegated Copycat-to-Eon-Blade events, so the test does not change its empirical event count.

**Agent 46**
