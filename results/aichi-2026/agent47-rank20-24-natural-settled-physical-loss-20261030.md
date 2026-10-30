# Original rank20 native natural draws: two actual 59-of-60 physical-card losses among 24 complete executions

**Agent 47 | 30 October 2026 | retrospective invariant audit, compiled pinned Store, zero competitive qualification.**

## Frozen original source coverage and exact evidence

This experiment reuses the **already frozen original** rank-20 source 60
versus authentic ranks 1 and 11, fixed seeds
`1847000101..1847000106`, both physical source seats `0/1`,
160 native root actions per execution. All **24** cells are retained, with
one baseline-policy game per cell. No Apex-discard proposal is enabled.
Both simulated players share the same research-owned, optional narrow
minimum-Energy bot correction that earlier recovered two original
AttachEnergyPrompt aborts. The new diagnostic is **read-only** physical
card reference accounting after each native root. It distinguishes
unresolved prompt-owned temporary physical cards from cards
stranded after an effect is settled.

- Native pinned submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Actual 24-game runner](../../simulation/twinleaf/agent47-source20-physical-ledger-24-native.cjs),
  [physical reference ledger](../../simulation/twinleaf/physical-card-ledger.cjs),
  [opt-in settled headless audit](../../simulation/twinleaf/headless.cjs).
- Successfully compiled and executed
  [CI 41134031798](https://github.com/FlareZ123/experiment-01/actions/runs/41134031798)
  at head `5ef8a1db07a87d23473cc6cd109d3fc35111f275`.
- Complete original 24-row
  [artifact 13015626093](https://github.com/FlareZ123/experiment-01/actions/runs/41134031798/artifacts/13015626093),
  ZIP SHA-256 `04b28bbcf4d03d49f460d593fba84dc9627fcffe99de5694c8d8280da9b37324`.
  The raw JSON lists every source rank/seat/seed, game completion/cap,
  exact source deal hashes, attack names, settled-root counts, and
  the first source-conservation failure of each affected game.

This sample is **retrospective for the newly devised invariant** and
does not authenticate game-decision quality. The original seeds, exact
source 60s and both seats were fixed before seeing these conservation
outcomes, and no failed cell was dropped.

## Native findings with full denominators

| Measurement | Observed |
| --- | ---: |
| Registered distinct native source games | 24 |
| Native returned without exception | **24 / 24** |
| Native game terminals | 7 |
| Ended at 160-action limit | 17 |
| Unique original source deals with valid hashes | 24 |
| Settled native root actions physically audited | **1,316** |
| Games with any settled original-60 count violation | **2 / 24** |
| Subsequent anomalous settled roots in those games, including first violations | **55** |
| Games containing a declared Celestial Roar | 6 |
| Symmetric minimum-Energy bot repair proposals | 4 |
| Competitively qualified games | **0** |

**The 55 anomalous root observations are dependent follow-up snapshots
from two corrupted games**, not 55 independently caused card-loss
events. Thus the defensible experimental unit is two affected **games**,
of 24 attempted; 6 with Celestial Roar declarations gives more relevant
exposure context, but no measured population-error probability.

The first two failures are sharply localized:

| Original source trial | First malformed settled root | Observed physical ownership |
| --- | --- | --- |
| Rank20 vs rank11, seed `1847000101`, rank20 physical seat `1` | Root **52**, `ResolvePromptAction`, displayed turn **11** | Seat0 = 60, **source seat1 = 59** |
| Rank20 vs rank11, seed `1847000103`, rank20 physical seat `1` | Root **98**, `ResolvePromptAction`, displayed turn **17** | Seat0 = 60, **source seat1 = 59** |

Both anomaly receipts show **zero unresolved temporary custody**,
**zero duplicated physical references**, **zero ghost attached Energy
indexes**, and a **single missing original source physical card**.
Thus the count failure is not an attached-Energy double-count or an
unresolved legitimate in-flight prompt artifact. Each first failure
occurred at a prompt-resolution boundary after an observed Celestial
Roar declaration in the preceding player turn. In the respective game
traces, Celestial Roar was declared at native turns 10 and 16 before
the first bad root.

The first-anomaly `actingSeat` field in the current diagnostic is
captured from `state.activePlayer` and reads seat0 in both cases.
It is a *current Active-player slot label*, not independent proof
of which player owned the prompt. The anomaly explicitly concerns
source physical **seat1's** original 60 in both cases; event
lineage and the prompt's actual `playerId` should be authenticated
from a focused separate real-Store root ledger before claiming an
exact source-card mechanism for each natural incident.

## Direct action ancestry for both naturally lost-card cases

After the unbiased full 24-cell diagnostic, the two source failures were
**selected retrospectively** for a separate, exact-original-source
native action-ledger replay. The compiled
[CI 41134979066](https://github.com/FlareZ123/experiment-01/actions/runs/41134979066)
**succeeded**; its complete
[artifact 13016116409](https://github.com/FlareZ123/experiment-01/actions/runs/41134979066/artifacts/13016116409)
has ZIP SHA-256
`65d4160e356750b6dc23bffb9e7a805072df3ed51d25dbc31cab72d3691f3aa0`.
The
[exact two-case source](../../simulation/twinleaf/agent47-natural-physical-loss-lineage-two.cjs)
reused the original seeds, seat, source60 and bot correction and
asserted the same first failed settled-root ordinal as the 24-game
sample. The two observations reproduced identically.

Crucially, native `rootActionLedger.initiatingRootActionOrdinal`
traces **both** first 59-card losses to Regidrago V's actual
**Celestial Roar `AttackAction` in source seat1**, including the
intermediate Energy prompt, rather than to a new independent opponent
action.

| Case | Source attack root (0-indexed) | Native Energy prompt root | First fully settled bad root (0-indexed) | Source count |
| --- | --- | --- | --- | --- |
| Seed `1847000101`, source seat1 | Root **47**, turn10, `AttackAction: Celestial Roar` | Root **48**, `AttachEnergyPrompt` | Root **51**, `ResolvePromptAction: WaitPrompt`, child of root47 | **59** |
| Seed `1847000103`, source seat1 | Root **93**, turn16, `AttackAction: Celestial Roar` | Root **94**, `AttachEnergyPrompt` | Root **97**, `ResolvePromptAction: WaitPrompt`, child of root93 | **59** |

The ledger indexes from **zero**; the physical-integrity recorder's
first-anomaly action ordinals **52 and 98** index from **one**.
The displayed current active-player seat of each later `WaitPrompt`
action was seat0, but each `initiatingRootActionOrdinal` is the
source-seat1 Celestial Roar. This resolves the earlier ambiguity
without using private Prize/deck information to choose an action.
The waiting prompt chain explains why the first *fully settled*
underflow is recorded several child prompt resolutions after the
Energy assignment; it does not create a new physical card.

The action ancestry, the verified physical 59-of-60 receipt, and
the independently read pinned `temp.cards.forEach` mutation bug
together provide **strong evidence of a real Celestial Roar effect
implementation failure in these two naturally dealt games**.
Precise stranded-card name and individual source transition were
not recorded. The small retrospective two-case replay confirms
mechanistic lineage, while the original 24 preserved trials remain
the only full sample denominator.

## Fail-closed native source-60 qualification gate, accepted on real Store cases

The shared headless runner now supports
`enforceSettledPhysicalZoneIntegrity: true` alongside
`capturePhysicalZoneIntegrity: true`, defaulting **OFF**. On the
first settled root containing a physical-ownership count violation,
the runner throws an explicit
`TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION` with its first receipt and
stops advancing the already corrupted game. Unresolved prompt
temporary cards remain exempt until the prompt is settled. The
strict option refuses to run without opting into the measurement.
It preserves the upstream pinned game files and never changes a bot
choice, Energy attachment, or action in a noncorrupted game.

This is **real native demonstrated enforcement**, not only a unit test:
fully compiled
[CI 41135309721](https://github.com/FlareZ123/experiment-01/actions/runs/41135309721)
succeeded with the independent
[three-case source-60 test](../../simulation/twinleaf/agent47-strict-physical60-native-3case.cjs).
Raw [artifact 13015927267](https://github.com/FlareZ123/experiment-01/actions/runs/41135309721/artifacts/13015927267)
ZIP SHA-256
`d5972f9e5918103c532d7317660c544e6c46c94accede6ecdbcaca8044a90f63`.

| Original rank20 vs rank11 source case | Strict result |
| --- | --- |
| Source seat1, seed `1847000101` | Fail-closed at exactly first bad settled root **52**, canonical counts **[60,59]** |
| Source seat1, seed `1847000103` | Fail-closed at exactly first bad settled root **98**, canonical counts **[60,59]** |
| Source seat0, seed `1847000101` | **No false abort**; 46 settled roots checked with zero physical-60 anomalies |

The passing case demonstrates only **this one physical invariant**
on one particular source deal. It does not qualify policy, card
effect correctness, prior native winner, or the tournament benchmark.

## Interpretation and release decision

An independent staged original-60 experiment already demonstrated
the pinned Regidrago V SIT Celestial Roar reducer's actual physical-card
loss from a mutating `temp.cards.forEach` after attaching Basic Energy,
plus its Basic-only filter that incorrectly excludes Double Dragon
Special Energy. See
[mechanistic source and both-seat native evidence](agent47-celestial-roar-native-paper-fidelity-20261030.md)
and [CI 41132531501](https://github.com/FlareZ123/experiment-01/actions/runs/41132531501).
The two naturally dealt source losses now have **authenticated native
root ancestry to Celestial Roar `AttackAction`** through their exact
`AttachEnergyPrompt` and subsequent waiting-prompt child sequence.
They still do **not** identify the exact stranded printing, establish
complete paper equivalence, or prove any alternative policy wins more.

**Do not certify or count the seven engine terminals as competitive
wins.** The same native engine still omits eligible Special Energy in
Celestial Roar; its bot can propose illegal mandatory attachment sizes
without a research-only correction; many other lock and copying
interactions lack complete paper-fidelity coverage. This audit
establishes an actual failure of the most basic paper-game invariant:
the original physical 60 must remain identifiable across the game.

Continued engineering priority: capture public root action lineage and
prompt owner at these two exact original seeds, enforce a validated
source-60 invariant on settled roots as an explicit simulation
qualification gate, and repair the actual paper effect behind an
opt-in research-side hook before running win-rate claims.

**Benchmark status: 29/32 complete authenticated opponent source 60s,
zero competitively qualified simulated games and no demonstrated
99.5% fixed-deck result.**
