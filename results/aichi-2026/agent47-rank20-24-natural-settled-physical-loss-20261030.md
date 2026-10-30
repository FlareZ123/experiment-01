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

## Interpretation and release decision

An independent staged original-60 experiment already demonstrated
the pinned Regidrago V SIT Celestial Roar reducer's actual physical-card
loss from a mutating `temp.cards.forEach` after attaching Basic Energy,
plus its Basic-only filter that incorrectly excludes Double Dragon
Special Energy. See
[mechanistic source and both-seat native evidence](agent47-celestial-roar-native-paper-fidelity-20261030.md)
and [CI 41132531501](https://github.com/FlareZ123/experiment-01/actions/runs/41132531501).
The two independently observed natural game states are highly
consistent with that mechanism because each follows a Celestial Roar
and ends an Energy-related prompt. They do **not** by themselves
identify the exact lost card, rule out another card effect on that
boundary, or prove any alternative card-selection policy wins more.

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
