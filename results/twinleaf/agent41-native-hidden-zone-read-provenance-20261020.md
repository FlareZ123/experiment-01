# Agent 41: original-State opponent hidden-zone read provenance, 20 October 2026

## Purpose and prior blocker

The single canonical rank-6/rank-11 bilateral development runner has not qualified a competitive outcome. At 15:42 UTC Agent 50 withdrew an earlier same-world action-parity inference: an additional strict check found that the detached capture was not proven graph-equivalent to the actual pre-decision native State on any of four historical arms. See `communications/agent41/20261020T1542Z_agent50_urgent_native_root_clone_fidelity_veto.md` and manual native CI 39449410246. That correction stands. This probe targets a smaller directly observable question without cloning the entire live State.

## Native-source-backed observation design

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` exposes both players in `State.players`, each player's own `hand`, `deck` and `prizes` as `CardList` objects with `cards` arrays. The native `SimpleTacticsAi.decodeNextAction` evaluates tactics on the full State; its `isValidAction` constructs an internal Simulator. Mere presence of the opponent's private arrays therefore does not establish that a bot *used* hidden information to choose an action.

The new research-side diagnostic `simulation/twinleaf/agent41-native-opponent-hidden-read-observer.cjs` intercepts one **actual native candidate decision** at physical candidate seat A or B on global turn 3. It temporarily instruments `cards` property reads on the real opponent hand, deck and each Prize pile, counting reads by zone and by phase:
- `proposal`: native decision path outside the direct `isValidAction` call.
- `validation`: path taken while the bot runs `isValidAction` and its internal simulator.

The observer returns counters and bounded redacted zone/phase events. It never includes private card identities.

**Interpretation refinement after checking pinned upstream source:** `ptcg-server/src/simple-bot/state-score/opponent-score.ts` reads `opponent.deck.cards.length` and `opponent.hand.cards.length` to score *publicly countable zone sizes*. This observer intercepts access to the `cards` array reference and cannot determine from that read alone whether any card identity was inspected. Even `proposal` reads can therefore be fully legitimate. Counters must be called **array-reference accesses** and cannot certify hidden-card identity access. Content-sensitive claims require a separate, noninterfering identity-level measurement or a native same-world causal contrast. It fingerprints the original State immediately before and after the authentic decision, and restores original native bot methods and card property descriptors on both normal and exceptional exit. If the genuine bot writes an observed `cards` field, the final data descriptor retains that value. This is intentionally **opt-in**, since accessor instrumentation itself may affect native copy/effect behavior; equality against an uninstrumented root ledger and same physical deal must be verified.

## Integration and falsification path

The four unchanged historical rank-6/rank-11 fixed-candidate game arms now accept `AGENT41_NATIVE_HIDDEN_READ_DEV=true`, which only adds `nativeOpponentHiddenReadAudit` on successful rows and exception metadata on failed rows. The control with the flag off uses the historical decision pipeline. The existing manual-only `aichi-source-locked-campaign.yml` exposes `agent41_dev_options=hidden-read` and runs `tests/agent41-native-opponent-hidden-read-observer.test.cjs`. No new workflow or push-triggered CI was created.

The four synthetic tests cover phase classification, missed target, exception cleanup, retained genuine writes, and card-identity redaction. **Synthetic tests are checks of the reporting mechanism, not authentic game evidence.**

Required acceptance for any native claim:
1. Compiled synthetic tests pass against the pinned upstream code, and the actual native candidate root is exposed.
2. Full opt-in and off-control games retain the identical source physical deal, actual starter and Store root ledger hashes; instrumented failures and censored arms remain counted.
3. Direct `proposal` reads are independently audited for provenance, including delegated tactics, known-top and K0/K1 owner knowledge; some reads may be permissible or incidental.
4. To prove an information-set violation, hold the actor's entire legitimate observation and policy RNG fixed, change only legally hidden opponent data, and show a causally attributable difference in actual proposed action. The stricter Agent50 same-world State fidelity gate remains necessary before accepting such a contrast.

A zero-read report on one sampled native root does **not** certify universal hidden-information safety. A positive read count by itself does **not** prove action dependence. This probe cannot establish a complete common decision policy, paper-rules fidelity, a tournament-clock result, a competitive matchup win, or the 99.5% target.

## Reproducibility and status

- Source: `simulation/twinleaf/agent41-native-opponent-hidden-read-observer.cjs`
- Tests: `tests/agent41-native-opponent-hidden-read-observer.test.cjs`
- Canonical integration: `simulation/evaluation/agent41-bilateral-v2-development.cjs`
- Manual workflow: `.github/workflows/aichi-source-locked-campaign.yml`
- Commits: `55bf20e7`, `02c4989c`, `ce2e342f`, `a588c369`, `b5b05858`
- Initial manual compiled run dispatched: [CI 39455323418](https://github.com/FlareZ123/experiment-01/actions/runs/39455323418). Its eventual result must be inspected before claiming a passing native diagnostic.
- Scope: historical development seeds and genuine native State boundary only. Field remains **29/32 exact published opponent 60s, zero competitive-qualified games, no proven final deck**.
