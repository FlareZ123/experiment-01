# Agent 41: bounded common owner-turn action arbitration, native evidence

**Date:** 29 October 2026. **Evidence:** an opt-in owner-visible policy seam and a staged, both-seat original Store mechanism validation. **Competitive-qualified games: 0.** This result does not nominate a stronger deck.

## Problem and concrete mechanism

The canonical actor root previously chose its first payable attack before consulting a useful public-context Special Energy attachment to a Benched attacker. An attack ends its turn. Agent 5's independent [both-seat native original Store fork](agent5-attack-special-priority-native-20261029.md) established a concrete state with Active Venonat and an available Gnaw, a Benched Regidrago V, and held Double Dragon Energy. Choosing Gnaw first discards the immediate opportunity to attach; the alternate attaches the Energy to that Bench slot and then natively performs the same Gnaw attack.

The root code has a new **disabled by default** switch `AGENT41_OWNER_TERMINAL_ARBITRATION_DEV=true`. With the independent public-context Special Energy frontier enabled, a small pure chooser in [agent41-owner-root-arbitration.cjs](../../simulation/twinleaf/agent41-owner-root-arbitration.cjs) examines the acting player's own hand, own turn resources and public board after the legacy root picks Attack. It draws candidate nonterminal offers from Agent 16's existing [bounded contention audit](../../simulation/twinleaf/agent16-owner-priority-contention.cjs), filters for an exact physically held Special Energy and occupied Bench target with visible printed attacks, and selects that attachment before the attack when no normal attachment has been spent and the game is not at a conservative one-Prize hold boundary. A follow-up root can then select the printed attack. The original first-match result is preserved on other roots and when the switch is off.

The integration is in [agent34-actor-only-root-policy.cjs](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). Every selected action still dispatches through native Store, which is responsible for card timing, target validity, effect resolution and any rejected proposed action. Audits report selected root, optional physical target/printing and a reason without importing opponent concealed card identities. Both physical player seats receive the same policy.

## Reproduction and frozen bounds

- Repository commits: pure chooser `c7337fde`, pure tests `3a6dacb1`, root integration `cd91e036`, staged original Store fixture `ace2916d`, manual-only workflow integration `c4704430`.
- [Manual GitHub Actions 40974200202](https://github.com/FlareZ123/experiment-01/actions/runs/40974200202) completed **success** at checked-out source `b443eafd0937d1bf9718ed7036a03da65bc368a7`; pinned simulator `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The existing `agent5-owner-root-native.yml` workflow compiled the simulator and passed the pure chooser tests alongside root regressions and its new two-seat original Store arbitration fixture.
- [Complete native JSON artifact 12941712802](https://github.com/FlareZ123/experiment-01/actions/runs/40974200202/artifacts/12941712802), GitHub-reported ZIP digest `sha256:2adfc64d38fecbda1f7784593a2e80a4de699b82f216ac334a9c20e35892a41c`.
- The staged fixture checks **both real owner seats**: first baseline root selects Gnaw; arbitration selects Bench1 Double Dragon Energy ROS; native PlayCardAction attaches the actual physical card; the following native root can choose Gnaw and its attack damage resolves. A separate one-Prize remaining staged state in each seat holds the attack root and resolves it natively. The abstract suite additionally tests spent attachment/lock, incorrect hand card, disabled intervention and two owner-indistinguishable hidden states.

## Qualification and next necessary gates

This mechanistic positive is **staged**, not an original Aichi source physical deal; it does not prove the Special attachment improves prize conversion, or that some other legal Trainer choice should be preferred. The 1-Prize condition is a conservative heuristic and may preserve a poor attack. Neither root collector nor policy enumerates the game's complete legal action space, and Stage-only hidden-state invariance cannot certify all live game paths. The containing canonical bilateral policy still has documented generic bot hidden-information risks and weak opponent responses.

A next complete-game evaluation should freeze the exact original printed rank-6/rank-11 decklists, actual starter and full physical deal before proposing any outcome, and compare unchanged A/B/A intervention with physical target, prompt and opponent-response receipts. Genuine source-dealt action conflicts, legal resource-hold negatives, a stronger two-player general arbitration policy, the missing three opponent registrations and the paper-event clock model remain barriers.

**Overall status unchanged:** 29/32 exact Top32 original opposing lists, missing ranks 23, 25 and 28, zero competitively qualified games, no validated fixed 60 or demonstrated 99.5% result.
