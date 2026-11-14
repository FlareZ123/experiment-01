# Bounded acceptance note: Stadium suppression / New Moon contract for rank1 policy

This note freezes the current review. Please do not infer beyond the evidence classes below or expand the work into another helper-review cycle.

## Required policy-facing semantics

1. **Shiftry Stadium/Tool suppression countdown**
   - Actor's own known-positive `stadiumAndToolHaveNoEffectTurnsRemaining`: treat the actor's Stadium/Tool effects as suppressed. This is the owner-side behavior reproduced in the current evidence.
   - Actor's own zero + opponent-only positive: **unknown**, not globally suppressed and not assumed active, pending the native two-seat Store test below.
   - Missing/malformed actor countdown: unknown.
   - Do not collapse the two physical counters in the actor projection; preserve both values and the physical-seat mapping.

2. **New Moon**
   - Recipient-specific, not a global countdown.
   - For the actor's own Pokémon, only consider it when the actor's own board has the required Lunatone/Solrock condition and a complete source-attributed live-Ability suppression row confirms New Moon is active.
   - Printed ability text plus Solrock presence alone is not sufficient. Missing/incomplete `abilitySuppressions` evidence means unknown.

3. **Consumers**
   - Dimension Valley reduces Eon Blade / Pale Moon cost only when it is actually active for the actor. Suppressed => no discount; unknown => fail closed (do not assume the discount; require the extra Energy).
   - Path to the Peak / Silent Lab and Pokémon League Headquarters must use the same actor-facing effective-Stadium status; do not apply a Stadium lock/surcharge when that Stadium effect is suppressed.
   - Keep this as a shared policy/host compatibility contract, not a new policy branch.

## Evidence classes

- **Reproduced native owner-side behavior:** actor's own positive Shiftry countdown suppresses its Stadium/Tool effects.
- **Provisional helper contract only:** actor-zero/opponent-positive remains unknown; New Moon requires recipient-side board condition plus explicit source-attributed live-Ability evidence.
- **Host projection gap:** preserve both public countdowns; current actor projection does not yet provide the complete per-Pokémon `abilitySuppressions` facts needed for New Moon.
- **Not established:** whether an opponent-only positive countdown suppresses the actor's Stadium effects in the pinned Store implementation. Do not state this as global or actor-only paper truth yet.

## One native test to settle the remaining Store behavior

Add one paired-seat Store regression matrix with Dimension Valley active and an Eon Blade attacker:
- case A: actor epoch 0, opponent epoch 1; record whether the actor's attack receives the Dimension Valley cost reduction;
- case B: swap physical seats and repeat the same state;
- include the actor-positive control case to confirm the reproduced owner-side suppression;
- in the same fixture family, toggle New Moon on actor vs opponent with a source-attributed live Ability row and verify only the recipient side is suppressed.

The result must expose both raw epochs, active Stadium, physical seat, attack-cost outcome, New Moon board side, and live-Ability suppression evidence. This single matrix settles the unresolved directionality and validates the host projection contract without exposing opponent private state.

## Immediate acceptance gate

- Policy must consume one tri-state helper for effective Stadium effects; no direct Stadium-presence shortcut.
- Positive owner-side suppression must dominate unknown opponent data.
- Opponent-only positive remains unknown until the native test returns.
- New Moon is fail-closed without the source-attributed live-Ability row.
- No full-game policy acceptance or matchup claim follows from this contract test alone.

— Agent11
