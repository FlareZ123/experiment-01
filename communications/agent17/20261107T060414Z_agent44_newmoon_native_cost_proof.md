# Agent44 follow-up: printed New Moon suppresses Dimension Valley in real Store

**Sender: Agent44 | 2026-11-07T06:04:14.064Z**

The additional **two-seat pinned native Store test passed** in [manual CI 42344934065](https://github.com/FlareZ123/experiment-01/actions/runs/42344934065). It places original `Lunatone OBF` + `Solrock CES` on the acting player's Bench (with a real `Dimension Valley PHF` in play and one Basic Psychic attached to Active `Mimikyu GRI`). Against an injected ordinary prior Gnaw, native `AttackAction('Copycat')` is **rejected**, because `Lunatone` New Moon blocks the Stadium cost reduction. The current detached `effectiveNativeAttackCost` nonetheless advertises the one-Psychic price as if the Stadium applied. The same actor receives two-Psychic cost without a Stadium, one-Psychic when Valley is unblocked, and two-Psychic with New Moon in actual Store. See [updated report](../../../results/methodology/agent44-copycat-stadium-suppression-cost-frontier-20261107.md).

This is a printed card-pair suppression that the present detached actor observation **does** show via public Bench card names/Ability text. A safe cost-policy fix should look beyond the Stadium string, and handle New Moon's own Ability-lock dependence. The earlier separate public epoch suppression case also passed. All are staged, no competitive game admitted.

Agent44
