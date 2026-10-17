# Rank-10 source replay: independent effect-state coverage audit

**Agent 48, 17 October 2026 UTC.** Scope: the source-dealt rank-10 champion-B / Regidrago control and Copycat alternate replay infrastructure, pinned Twinleaf at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a code-and-contract audit. **No additional competitive games were qualified.**

## Evidence boundary

The 17 October manual replay [38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636) reconstructed every archived live root dispatch input in a separate process (350 control, 235 alternate), with equality of recorded `observedCounts`, `sourceZoneSnapshot`, and `observableState` before and after each action. These are meaningful transport checks. Their names and docs explicitly describe **partial** State projections.

A read of the actual pinned upstream TypeScript `State`, `Player`, `PokemonCardList` and `Store` classes establishes that several mechanics-bearing fields have no representation in either projected digest. Therefore even complete digest equality across all dispatches cannot, alone, establish semantic equality of the reducers and their executable continuation.

| Witnessed omission | Source field / source location | Why its independent value matters |
| --- | --- | --- |
| Play-lock scope/duration | `Player.cannotPlayToolCards`, `cannotPlayStadiumCards`, `playLocksTurnsRemaining`, `attackPowerSuppressions` | Changes the actions allowed during a turn and the duration of restrictions; existing projection records Item/Supporter/Pokémon locks but omits several other categories |
| Delayed attack resolution | `Player.pendingEndOfTurnEffects` | A scheduled Knock Out, discard, condition or damage-counter effect can change a subsequent legal state even when the current ordered card zones are unchanged |
| Pokémon attack protection | `PokemonCardList.damageReductionNextTurn`, `preventDamageNextTurn`, `preventEffectsOfAttacksNextTurn`, pending variants | Alters damage and counterattack legality without changing HP, attached cards or the subset of status flags currently projected |
| Pokémon temporary rules | `PokemonCardList.cannotUseAttacksNextTurn`, `attackCostIncreaseNextTurn`, `cannotAttachEnergyFromHandNextTurn`, `marker.markers` | Changes attack and attachment choices while preserving ordinary printed-attack identity and physical zones |
| Prompt controller and detailed prompt eligibility | `State.promptControllerId`; each `Prompt.perspectivePlayerId`, `sourceCard`, `options`, `filter`, `cards` | Current snapshot records only unresolved prompt ID, class name and player ID; choices and response perspective can differ at identical visible summary |
| Store-private continuation | `Store.promptItems[].then`, `waitItems`, `trainerPromptSources` and `resolvingTrainer` | The Store resolves prompt results through callbacks held **outside** `State`; neither `sourceZoneSnapshot(state)` nor `observableState(state)` can observe their content |

Primary inspected source contracts, fixed revision:
- `ptcg-server/src/game/store/state/state.ts`
- `ptcg-server/src/game/store/state/player.ts`
- `ptcg-server/src/game/store/state/pokemon-card-list.ts`
- `ptcg-server/src/game/store/state/pending-end-of-turn-effects.ts`
- `ptcg-server/src/game/store/prompts/prompt.ts`
- `ptcg-server/src/game/store/store.ts`

The production projections are `simulation/twinleaf/source-zone-checkpoint.cjs` and `simulation/twinleaf/source-state-continuity.cjs`. The former documents its intentionally limited scope; the latter hashes the same zone projection plus `damageTakenLastTurn` across cards. The proposed missing fields above are established from the pinned source, without extrapolating whether a particular missing field differs in the archived rank-10 fork.

## Reproducible adversarial falsification controls

`tests/source-mechanics-blindspots.test.cjs` creates two-player in-memory state fixtures and checks:

1. **Positive control:** changing a represented Item lock or `usedGX` changes both existing SHA-256 digests.
2. **Collision:** Tool lock plus duration change leaves both digests equal.
3. **Collision:** a 30-point next-turn damage reduction plus attack-damage prevention leaves both digests equal.
4. **Collision:** adding a scheduled `Pale Moon-GX` end-of-turn Knock Out to `pendingEndOfTurnEffects` leaves both digests equal.
5. **Collision:** changing prompt controller and adding a player effect marker leaves both digests equal.
6. **Scope exclusion:** replacing a Store's private prompt callback queue while keeping `state` identical is invisible to State-only digests.

The last case requires comparing live Store metadata or callback behavior; attempting to certify it from a State projection alone would be circular. Tests are a **diagnostic exposure of known gaps**, so the collision assertions are expected to pass until the digest contract expands. Synthetic mutation examples are falsification witnesses; they are **not** claims that these mutations occurred during the actual rank-10 recorded games.

## Acceptance implications

The existing transport milestone stands. Keep `replay-input-transport-complete` true for the one source deal; keep `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false`. The 99.5% goal has zero qualified game outcomes.

A suitable next verification stage should:

- Capture an **additional, versioned effect-state digest** for both players, every in-play Pokémon and pending prompt, preserving the historical source-zone digest unchanged for old archives.
- Include root Store prompt-queue identity, pending callback eligibility and other non-State continuation data. Function source text alone cannot establish equality of captured lexical environments; use actual prompt-result continuation tests and card-effect assertions.
- Add adversarial paired-State tests that flip each listed field without changing physical zones, proving that the new check rejects the difference.
- Record before/after source mechanics at each authentic root dispatch and test both archived arms in a fresh process. Diagnose the five existing corrected-clone between-action continuity gaps using the widened scope.
- Only after mechanics and source isolation pass, review opponent decisions, both starting seats, fresh independent seeds and paper-rule equivalence.

A new digest must never silently reclassify historical input-replay evidence as mechanics-qualified. Retain hashes, scope, and source revision with each claim.


## Cross-review of corrected-clone research-hook boundaries

Independent inspection of the full archived [compiled CI 38992559596 rank-10 trace](https://github.com/FlareZ123/experiment-01/actions/runs/38992559596/artifacts/12085698259) identified exactly matching source-action adjacencies for the previously unattributed two copied-attack history gaps. In the **control** arm, root dispatch **177** was genuine `ChooseAttackPrompt` id 109, turn 26; dispatch **205** was `ChooseAttackPrompt` id 128, turn 28. Both selected the actual `Koraidon ex TEF` printed `Kaiser Tackle` attack (source index 2, attack index 1), and the immediately following actions 178/206 were `WaitPrompt` resolutions. In both instances, the archived `zoneDigestAfter` and `continuityDigestAfter` of the choice dispatch differ from the corresponding next-dispatch `*DigestBefore`. Agent 22's independent [live observer](agent22-rank10-continuity-hook-boundaries.md) identifies both changes as `playerLastAttack` transitions from `Kaiser Tackle` back to `Apex Dragon`. The pinned research `copycat-declared-history-hook.cjs` performs precisely that restoration **outside the inner recording wrapper** after a qualifying ChooseAttackPrompt. Together these are a concrete source-aligned attribution. They do not prove that all external hooks, reducers or paper effects are correct, and the full posthook Store graph was not archived in that earlier run.

## Store graph follow-up

A new optional [full root Store data-graph fingerprint](../../simulation/twinleaf/store-data-graph-fingerprint.cjs) now records object aliases, enumerable own descriptors, markers/effect fields, prompt queue and trainer callback metadata, with explicit exclusions for log contents, transport handler and closure lexical environments. Dedicated [adversarial graph tests](../../tests/store-data-graph-fingerprint.test.cjs) include a **known callback-capture collision**: two same-source functions can close over different outcomes but have the same digest. The recorder and the independent fresh-process replay now compare the additional graph at each action, and a versioned fail-closed acceptance check requires complete coverage. **This is still a stronger data-state comparison, not source reducer or paper-rule qualification.** CI [38993098833](https://github.com/FlareZ123/experiment-01/actions/runs/38993098833) was dispatched at `e41caaae`; its compiled success/failure must be checked before claiming empirical Store parity.

## CI and status

The six pure tests are wired into the existing manual `.github/workflows/aichi-dispatch-transcript.yml` verification step. No per-commit workflow or additional compiled workflow was introduced. Test and run status should be updated from an actual run; a green existing replay is insufficient if these new tests have not executed.
