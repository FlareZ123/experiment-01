# Rank-6 source Special Energy: a newly reproduced native sudden-death clock boundary

**Agent 3; 21 October 2026 UTC. Evidence type: newly executed pinned native-Store diagnostic.** This confirms the native marker associated with a *new run's* turn-clock reversal. It does not recover the lost fields of the original run, certify paper Expanded tiebreak semantics, validate an entire game, or establish competitive deck strength.

## Prior failure and nonretroactivity

The earlier Agent 3 Special Energy ON comparison, [manual run 39502044313](https://github.com/FlareZ123/experiment-01/actions/runs/39502044313), failed on the rank-6 champion-reference / physical candidate A arm at `ResolvePromptAction`, root ordinal 38, turn 4→0. [Agent 17's independent immutable-archive inspection](agent17-rank6-ordinal38-archive-closure-20261021.md) established that its failed row did not preserve `suddenDeathClockResets` or a full `rootActionLedger`. **The original artifact remains 3/4 strict packets, with an unauthenticated reset.** A later reproduction cannot retroactively supply those fields.

## Fresh experiment, immutable provenance

- Existing **manual** canonical workflow `.github/workflows/agent7-canonical-actor-bilateral.yml`, [run 39534314558](https://github.com/FlareZ123/experiment-01/actions/runs/39534314558), Git checkout head `9a6e1fd4369e68343cd67c56d94a062a9897f0da`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Inputs: `special_energy_root=true`; all other manually configurable inputs left at workflow defaults. Canonical paper Supporter guard remained enabled by workflow. Output manifest confirms `actorOnlyCompositionOptIn=true`, `paperSupporterQuotaOptIn=true`, `sourceFirstRetrospective=false`.
- Archived complete four-arm JSON: [artifact 12316468122](https://github.com/FlareZ123/experiment-01/actions/runs/39534314558/artifacts/12316468122), member `agent7-canonical-actor-fourarm.json`. ZIP SHA-256 `b0f8ebf86841606eeeeab1a6068dcb000c52448bdd0cf65ac827a7993c328b2b`; contained JSON SHA-256 `91fd81701f488badaa4f5f5b611d1e118c71ff8aadb0c645e8cc0da555d973be`.
- The reproduced failed cell is `6:0:A:champion-reference`, source rank 6, original registered `seed=407516727`, candidate physical seat A. Thus the **seed/trial configuration and reset ordinal match the prior failure**, while the repository code revision and observable marker belong to this new run and must remain separately identified.

The freshly persisted `nativeEpochBoundaryEvidence` field (Agent 44's read-only parser) says:

| Property | Reproduced value |
| --- | --- |
| `rootCount` | 121 |
| `rootProtocol` | `actual-store-root-action-ledger-v1` |
| `sourceProtocol` | `actual-native-sudden-death-clock-transition-v1` |
| Reversal `ordinal`, `playerSlot` | 38, 0 |
| Root action, pending prompt | `ResolvePromptAction`, `WaitPrompt` |
| Parent initiating root | 33 |
| `turnBefore` → `turnAfter` | 4 → 0 |
| `nativeMarkerCount` | 1 |
| `fromPhase` → `toPhase` | 3 → 1 |
| `beforeSuddenDeath` → `afterSuddenDeath` | false → true |
| `enteredSetup` | true |
| `nativeMarkerExact` | true |
| `orphanMarkers` | [] |
| `nativeMarkersAuthentic` | true |

The new audit's exact-match predicate checks ordinal, acting seat, action, pending-prompt type, source and target turn, native sudden-death flag after transition, and entry into the setup phase. Consequently **this new turn reversal was recorded by the native engine as a sudden-death setup restart**. The independent paper correctness of that engine behavior has not been established. The audit deliberately emits `nativeNewDealFingerprintAuthenticated=false`, `paperTiebreakAndClockAuthenticated=false`, `crossEpochBilateralPacketAllowed=false` and `qualifiedForCompetitiveInference=false`.

## Failure-inclusive panel and remaining barriers

The **workflow concluded failure**, as expected under strict single-epoch validation: `attempted=4`, `errors=1`, `actorOnlyCellsWithAudits=3`, `competitiveQualifiedGames=0`. The other three historical arms yielded actor audits, while the failed arm's source-deal fingerprint remains missing in its row. Rank-6 paired `sameSourcePhysicalDeal=false` because the failing row lacks its fingerprint; do not infer a completed pair from the successful New Moon row. The rank-11 historical pair has matching source fingerprints but remains development-only. The source-first retrospective panel was not invoked.

The native marker provides the previously missing **reproduction-only boundary classification**. A true cross-epoch verifier must independently preserve each replay episode's original physical deal and Prize state, chronological ancestry, epoch-specific turn origin, and exact prompt/attack settlement lineage. The supplied Advanced Player's Rulebook, section E (Win and Loss), also prescribes a new six-Prize tiebreaker where the first player to have fewer Prizes remaining wins; the engine's `isSuddenDeath` designation by itself does not establish that this rule or a competition clock was implemented faithfully. Until these are proven, the strict packet's reversal rejection is correct for competitive inference.

**No original historical packet was repaired or promoted.** Status remains 29/32 exact published opponent 60s recovered, three unavailable (23/25/28), zero competitively qualified games, no demonstrated 99.5% fixed-60 win rate.

## Integration handoff

Preserve Agent 44's error-safe `nativeEpochBoundaryEvidence` and unmarked reversal negative-control tests in the **single canonical** `agent41-bilateral-v2-development.cjs` executable. The next action belongs with the common packet owner and evidence reviewers: define explicit replay-epoch segments, retain the original failed row, derive a separate *new* six-Prize deal fingerprint if obtainable from genuine Store setup, and forbid source-pressure/reply/continuation witnesses spanning epochs. Do not relabel a native marker as a competitive result.
