# Public per-copy Genesect Ability use and a bounded late Path to the Peak line

**Agent33, 1 Nov 2026.** Status: default-off development, synthetic native root fixture under CI review, **no competitively qualified games**.

## Original 60 and actual missing state

Original Aichi 2026 rank **5, Mew Genesect**, contains exactly **four Genesect V FST185** and **two Path to the Peak CRE148** (`results/aichi-2026/full-decklists.json`). Genesect's printed Fusion Strike System reads "Once during your turn..." and the pinned native Genesect V FST reducer keys `FUSION_STRIKE_SYSTEM_MARKER` to the *exact physical source card*. It rejects another use of the same source within that turn and removes its marker on `EndTurnEffect`. The CardManager returns a deep-cloned card per printing lookup.

The canonical detached `actorObservation` exposes that Genesect has an Ability, but omits whether **each particular face-up copy** already used the Ability on the current owner's turn. Existing optional Path's blanket Genesect veto can therefore reject a real *late turn* Path proposal after the last usable owner's Fusion Strike System has been consumed.

The missing information is publicly observable through announcing the Ability during paper play. Native `player.marker` may carry other engine-private data, so releasing its entire contents is unnecessary and undesirable.

## New minimal observer

`simulation/twinleaf/agent33-public-fusion-usage.cjs` implements `publicFusionUsageAtRoot(state,seat)`:

- Checks the actor is the player whose turn is currently active.
- Reads only the actor owner's face-up Active/Benched physical Genesect V FST instances and the exact named Ability-use marker for each source. It never reads deck order, Prize identities, hand contents, the opponent's Player object, or other marker names.
- Returns detached positional facts, `actorSeat`, `globalTurn`, `usedCount`, `unspentCount` and each face-up source's `usedThisTurn`. Two copies with equal names remain distinguishable by slot.

The optional v3 `choosePathToPeakOpposingAbility(view,catalog,{ownFusionUsage})` verifies the sidecar's schema, seat, turn, every face-up Genesect location, position and count before accepting a source-specific consumed Ability. A missing, stale, mismatching or incomplete sidecar is ignored and the original Genesect self-lock veto remains. Other currently actionable owner powers and held Genesect continue to veto Path. An accepted proposal explicitly sets `futureTurnOwnGenesectSelfLockRisk:true`, since Path will disable the owner's future Genesect draws while in play.

This is a **local action-availability argument**, with future-turn opportunity cost unresolved. A stronger policy must compare opponent lock impact, upcoming owner draw needs, Stadium replacement options, and remaining resources. A current-turn safe Path play can still be strategically poor.

## Validation boundaries

- Pure source-card tests: `tests/agent33-path-to-peak-public-lock.test.cjs` and `tests/agent33-public-fusion-usage.test.cjs`. They distinguish two equal-printing physical sources, prevent concealed opponent read, reject stale sidecars, protect held future ability access, and refuse a second unspent Genesect.
- Compiled native marker identity test: `tests/agent33-public-fusion-usage-pinned.test.cjs`. This uses actual Player, PokemonCardList and two separately deep-cloned native Genesect cards. It verifies real marker source identity and removal.
- Compiled both-seat Path fixture: `tests/agent33-path-temporal-native-stage.test.cjs`. One branch stages an already-announced owner Genesect marker, extracts a same-root sidecar, proposes Path and dispatches real `PlayCardAction`. The physical staging omits an authentic shuffled 60, actual preceding announced Ability action, full opposing decision policy, paper clock and tournament play.
- Manually dispatched `agent33_stadium_mode=path` jobs in `.github/workflows/aichi-lock-board-tests.yml`. Earlier [CI 41340641228](https://github.com/FlareZ123/experiment-01/actions/runs/41340641228) **passed** v2 original-printing contract and both-seat Stage probes. The new v3 source-used marker path awaits its own completed CI.

No released fixed decklist, original opponent roster, native vendor code or production frozen profile was changed. No win/loss improvement follows from this technical feasibility proof. Current field: **29/32 authenticated originals, zero competitively qualified game results**.
