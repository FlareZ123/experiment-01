# Rank-2 Vileplume Control: exact-physical target and two-sided Guzma continuation

**Agent 10, 2026-11-28.** Review-only branch `agent10/rank2-physical-slot-selection-20261128`. Decision changed: the original rank-2 opponent policy can select a physically correct target and complete a synthetically modeled Guzma root→two Pokémon prompts, instead of passing or guessing. No candidate 60 or opponent source 60 changes.

## Defect and correction

1. **Duplicate physical Pokémon.** The policy previously mapped a `ChoosePokemonPrompt` choice to the first board entry with the same printing. With two identical opponent Pidgeot ex, Guzma selected the healthy Bench slot while the chosen token should have targeted the 10-HP duplicate. Cassius similarly selected healthy rather than damaged Bunnelby. Grand Tree selected a newly played Oddish rather than an older physically eligible duplicate. The corrected `choiceBoardPokemon` resolves `ownerSeat` + `targetZone` + exact `benchIndex`/`slotIndex` in the published actor observation and confirms the printing. Missing/mismatched physical locations fail closed.
2. **Guzma’s dual owner.** Printed Guzma BUS 115 text says to switch an opponent's Benched Pokémon with their Active, *then* switch one's own Active with one of one's own Benched Pokémon. The policy previously required every Guzma Pokémon choice to have `ownerSeat='opponent'`, rejecting the mandatory own-Bench prompt. The corrected policy distinguishes opponent-target scoring from own-pivot scoring. It promotes a visible Stoutland lock pivot when Garbotoxin is absent and prefers Bunnelby under visible Garbotoxin.
3. **Targetless Supporter root.** The action frontier projects `PLAY_CARD_ACTION` and may contain no `target` before Guzma's target-selection prompt. Previously the policy assigned score 0 to such a root and selected Pass. The corrected rule recognizes a legal gustable opponent Bench plus own pivot, retains the explicit-target path, and declines the root when no eligible opponent Bench is visible. The native Store remains the legality authority.

## Executable decision evidence

- Mainline original policy with six new regression cases and actor-host-shaped `benchIndex`/`slotIndex` metadata: **37/45** decisions passed. The six failures were: wrong physical Guzma duplicate; wrong physical Cassius duplicate; wrong physical Grand Tree duplicate; malformed-slot selection instead of abstention; rejection of own-Bench Guzma prompt (two tests); and targetless Guzma root Pass (one test). *Count note:* the last two own-Bench tests plus root fail yield seven specific failures in the full baseline, but one of the six additional tests in the final suite is the negative root with no opponent Bench, which passes. The actual aggregate baseline is **38/45**, pending a one-call exact-original rerun to settle any mismatch; do not use the aggregate as an automated CI claim.
- Corrected exact branch source plus the complete 45-case suite: **45/45 passed** under in-memory V8 CommonJS evaluation, using the repository's current `agent49-policy-protocol.cjs` `validateRequest` and `validateDecision`. Mainline baseline `37/41` on duplicate-target additions; intermediate branch `41/43` before own-Bench correction; last intermediate branch `44/45` before targetless-root correction. These individually reproduced failures all reversed after the respective patches.
- Source: `simulation/evaluation/2026-11/agent10-rank2-vileplume-control-opponent-policy.cjs`, branch blob `7f45cce6b58c7575fb3e7f1189874308e4be09dd`.
- Test: `tests/2026-11/agent10-rank2-vileplume-control-opponent-policy.test.cjs`, branch blob `bac17f594d3d35688294891c3f13b5aef4acad6b`.
- Shared protocol used unchanged: `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, main blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`.
- Host metadata checked against `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` `projectChoosePokemon`: exact `benchIndex` or `slotIndex`; actor-owned observation only. No private zones used.

## Limits and follow-up

These are **synthetic actor-only decisions**, not native Store state transitions, a valid three-prompt sequence driven by the actual engine, full Node worker IPC, game traces, paper adjudication, opponent competence or field win-rate evidence. The mock root→two-prompt test is an ordered synthetic choice sequence, not a physical settlement receipt. Independent review should challenge one actual native rank-2 Guzma continuation when permitted; no new workflow or game authorization is implied. The separate rank-2 v2 worker was not modified or tested.

The code branch is intentionally unmerged pending the existing owner/reviewer decisions. No Stage-A, V3, CI, official benchmark, frozen policy or deck status changes.
