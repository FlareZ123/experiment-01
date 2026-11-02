# Agent 23: genuine first-finite-scored Twinleaf policy replay one-draw deficit

**2 November 2026.** Original pinned native Store decisions and two historical
candidate policies, no additional competitive games. The initial experiment was
[GitHub Actions 41419691107](https://github.com/FlareZ123/experiment-01/actions/runs/41419691107),
head `625765559e14d9c3d6c39c50cdf824b7b31fef14`; archived full original
JSON artifact **13130266088**. A follow-up with a read-only,
reversible `BotArbiter.prototype.shuffle` observer was compiled under
[41421195189](https://github.com/FlareZ123/experiment-01/actions/runs/41421195189),
head `5ad9916b17067e8982e8bc15d6e14c4cfaa96d05`, archived full JSON
artifact **13130303062**.

## Result

**All 4/4 genuine Store control/probe game roots remained authenticated and
unchanged. Exactly 1/4 reconstructed native owner decisions satisfied strict
same-physical-world RNG-tape parity.** The remaining 3/4 failed before any
concealed-state comparison because the replay attempted one more RNG call than
the captured native tape and swallowed the exhaustion inside a native tactic.
Such roots are invalid for subsequent information-set claims.

| Historical development root | Original first finite-scored tactic | Native genuine decision RNG draws | Recreated decision draws attempted | First native shuffle deck count, genuine/replay | Strict same-world parity |
| --- | --- | ---: | ---: | --- | --- |
| Rank6, champion reference | PlaySupporterTactic, Lillie's Determination | 40 | 41 | 41 / 41 | Veto |
| Rank6, New Moon Lockbreaker v1 | PlayTrainerTactic | 40 | 41 | 41 / 41 | Veto |
| Rank11, champion reference | PlayTrainerTactic | 5 | 5 | no shuffle / no shuffle | Pass |
| Rank11, New Moon Lockbreaker v1 | PlayTrainerTactic | 41 | 42 | 42 / 42 | Veto |

The first three failed source/replay numerical root projections matched
hand, deck, discard, Prize, and Bench counts before their first native
speculative actions. Their native first action-scoring traces differ at the
first candidate requiring a RANDOM arbiter shuffle. Source evaluation returns
finite scores (-24, 69, 235 respectively), whereas the exact-tape replays
return `undefined` after the overread. The native source and replay first
shuffle deck lengths were **identical**, falsifying the hypothesis that
replay merely shuffled an extra deck card. The historical source tape
captures 40 draws during a 41-card shuffle in rank6 and 41 during a
42-card shuffle at rank11.

Pinned upstream `BotArbiter.shuffle`
(`ptcg-server/src/game/bots/bot-arbiter.ts`, commit
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`) computes
`const len = cards.cards.length` and calls `Math.random()` inside
a `for` loop with `i < len`. Source vs replay RNG trace stack frames
differ between `bot-arbiter.js:37` (the shuffle callsite) and
`bot-arbiter.js:75` (the per-card RNG loop), but stack shape alone cannot
establish the error's cause.

At the time of the original 41419691107 run the implementation mismatch
had not yet been identified. Its consistent one-draw deficit is explained by
the actual research-owned `installFairBotHooks()` behavior described below.
RNG tape padding and relaxed consumption remain prohibited.

## Root cause: original research fair-shuffle hook absent from postgame replay

The decisive source/replay inconsistency was located in
`simulation/twinleaf/headless.cjs`:

- `installFairBotHooks()` (lines 154–177) patches the native
  `BotArbiter.prototype.shuffle` with a uniform Fisher–Yates
  `deckPermutation(cards.cards.length,Math.random)`, with a loop
  `for (i=length-1; i>0; i--)`, therefore consuming **length minus one**
  random draws.
- During the same real Store game it also patches
  `game/bots/simulator.Simulator` with `FairSimulator`.
- The full game installs these research-owned hooks at line 580 and
  explicitly restores them at lines 2097–2098. All postgame decision
  replays were therefore unexpectedly using the restored native
  `BotArbiter.shuffle` and original Simulator rather than the same
  fair research boundary used at the actual source decision.
- The pinned native shuffle itself loops `i=0; i<len; i++`, consuming
  **length** random draws. This produces the exact 1-draw mismatch.

This is confirmed empirically in
[compiled run 41424257029](https://github.com/FlareZ123/experiment-01/actions/runs/41424257029),
original JSON artifact **13132315283**. The original source shuffle's
function SHA256 was
`5e6088f0d79fd766fba6bf8cb427c93bfdf354b306b67614f5b7aa3d7085d032`;
the postgame replay native shuffle's hash was
`d3e8a9d7c30037e132b49ed9e3a6019f06598816f915bb4c4ab38740cf5eeeb3`.
Those hashes matched within each role across the three failed historical
arms, but **not across source and replay**. Read-only deck-length
and optional exact-forwarding inner RNG-call counts established:

| Role | Shuffle card count | Actual draws inside implementation |
| --- | ---: | ---: |
| Rank6 source / replay, both arms | 41 / 41 | 40 / 41 |
| Rank11 NewMoon source / replay | 42 / 42 | 41 / 42 |

Both original Store playback controls and all four source root
noninterference gates remained passing. This resolves the immediate
implementation-count puzzle with a concrete cause in the research adapter.
It does **not yet** show that reapplying the fair hooks restores full
native decision parity. Other original game hooks also restore at end.

The scoped fix is opt-in `nativeTapeFairReplayHooks`, exposed by the
manual workflow input `agent23_native_fair_replay_hooks`. It invokes
the already-exported `headless.installFairBotHooks()` during every
reconstructed postgame native decision, in `finally` restoring the
same simulator and shuffle references. The genuine source and
strict source tape remain untouched. The inner RNG trace, entry-only
clone experiment and both audit modes remain default-off.

## Scoped falsification procedure

Added `simulation/twinleaf/agent23-native-arbiter-shuffle-observer.cjs`,
observational only, numeric shuffle deck counts and no card identities or
extra draws; wrapped inside `native-policy-tactic-sequence.cjs` only
when `traceArbiterShuffleLengths` is true. This is enabled only for
opt-in first-finite-score replay and restored in `finally`.

The next experiment enables an explicit diagnostic
`agent23_native_finite_entry_only` workflow input. In this mode,
`captureAtScore` reuses the authenticated decision-entry snapshot rather
than repeating a deep clone while recording the source RNG tape. It still
records whether the physical State changed before the first score and
preserves the full original-game noninterference check. The baseline native
mode remains unchanged. The first attempt had a unit-test assertion comparing two independent
unseeded fixture RNG values and consequently failed before the native step
(run 41422377083). The test was corrected to compare deterministic fixture
action fields. The compiled rerun
[41422863744](https://github.com/FlareZ123/experiment-01/actions/runs/41422863744)
then passed its tests and four original Store controls (full JSON artifact
**13130189273**). Its classifications and first shuffle observations were
identical to the preceding run: **1/4 strict parity**, three source
one-draw deficits and same source/replay shuffle deck lengths. Thus the
redundant first-score deep clone is **not sufficient** to explain this
mismatch. The optional entry-only mode remains development-only; do not
remove the original strict parity veto.

## Interpretation and remaining work

This is a **replay-fidelity diagnosis**, involving four previously exposed
historical starts and two policies. The rank11 champion pass confirms that
reconstruction works for at least one scored decision without shuffle.
A passing or failing parity check does not itself assess card strength,
legality, paper timeouts, concealed-player fairness throughout a match, or
win rate. No game here qualifies for the Aichi objective; original source
ranks 23/25/28 remain unavailable. Continue under one fixed 60-card
candidate and all-opponents requirement when simulation is credible.
