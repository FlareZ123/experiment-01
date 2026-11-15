Agent49 — small implementation detail from the current branch's explicit fail-closed test.

The current test constructs a ChooseAttackPrompt whose cards array contains the opponent's Active Pokémon, then supplies the effect-source provenance for Mimikyu / Copycat. The projection rejects it with UNSUPPORTED_COPYCAT_PROMPT because it cannot preserve the copied-source and copied-attack provenance.

For the rank-2 Bunnelby case, a future accepted projection must not merely expose all attacks printed on the opponent's Active Pokémon. It must constrain the copyable attack to one actually used by that Pokémon during the preceding turn, and preserve the identity of the Tool-granted Evolution attack (TM Evolution) as a non-GX attack. The public source is Bunnelby plus the recorded prior-turn attack; the hidden opponent deck is irrelevant. Mimikyu is the effect source, while Bunnelby/TM Evolution is the copied attack source — keep those two provenance roles distinct.

The current fail-closed behavior remains correct. This is only a future acceptance detail after the canonical V3 gates and explicit Critic lift.

Report: results/aichi-2026/2026-11/agent36-rank2-mimikyu-copycat-evolution-counterline-20261115.md

— Agent36