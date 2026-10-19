# Agent 32: rank-6 opening attachment preflight and budgeted CI

**19 October 2026 UTC.** Research-owned correction to the **opt-in** source
Iron Thorns line selector. This is a game-action safety constraint and
regression, **not** an independently qualified game, an optimized deck, or a
99.5% performance claim.

## Failure mode

Before this change, `planOpeningHand` had a useful preflight for a blocked
Special Energy attachment but omitted two distinct owner-observable reasons
that an otherwise attractive `Guzma & Hala → Thunder Mountain → DCE → Volt
Cyclone` sequence is unavailable:

1. A broad `cannotPlayEnergyCards` restriction may prevent playing an Energy
   card from hand, including Double Colorless Energy.
2. If the acting player already used their one normal Energy attachment
   during this turn, the plan cannot attach a held or newly searched DCE.

The second constraint matters even when DCE is **already in hand**:
`needDce` measures whether to *search* for it, not whether attachment
from hand is required. A source policy that spends its sole Supporter or Tag
Call without testing this condition may strand its own planned attack.

The supplied Advanced Player's Rulebook, C. Energy Cards, states the normal
one-Energy-from-hand-per-turn limit. The **pinned** Twinleaf
`play-card-reducer.ts` at
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` checks
`player.energyPlayedTurn===state.turn` and rejects a second normal
attachment with `ENERGY_ALREADY_ATTACHED`. It also explicitly exempts
`player.usedDragonsWish===true` and
`state.rules.unlimitedEnergyAttachments===true` from that ordinary
attachment counter. The pinned `player.ts` declares both
`cannotPlayEnergyCards` and `cannotPlaySpecialEnergyCards`.

## Changes and gates

- [Broad rank-6 research-side policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs)
  now accepts `energyLocked` and `energyAlreadyAttached` in the pure
  plan preflight, while preserving existing Special Energy, Item, Supporter,
  and Stadium constraints.
- When `playLockAwareOpening:true` is explicitly selected, the real
  owner-visible player's lock/counter fields and existing pinned-engine
  exceptions feed the plan. An already attached Active DCE does not require
  a fresh attachment.
- `dceHandAttachmentBlocked` also rechecks the live player and turn before
  the actual planned manual attachment. If a restriction appears after the
  initial plan, the source tactic records an abort rather than blindly
  dispatching the invalid attachment.
- [Pure regression tests](../../tests/rank6-broad-thorns-policy.test.cjs)
  cover spent attachment with held DCE, spent attachment before G&H search,
  broad Energy hand lock, allowed attached-DCE attack, ordinary-turn reset,
  both documented multiple-attachment exceptions, and lock precedence.
- The **existing manual-only** [rank-6 workflow](../../.github/workflows/aichi-iron-thorns-first-attack.yml)
  gained `policy_smoke_only:true`. It runs syntax and policy tests on
  Node 22 without installing/compiling Twinleaf, while the unchanged
  default branch still runs the full pinned integration suite. No
  push-triggered CI workflow was created.

## Evidence

- Verified source updates: `1dad5625` (guard), `f4dcf4f8`
  (tests), `e097ce8f` (CI smoke option).
- Fresh isolated JavaScript execution of all **23/23** pure policy tests
  passed, then [manual GitHub Actions run 39329505860](https://github.com/FlareZ123/experiment-01/actions/runs/39329505860)
  **completed successfully** at source head `e097ce8f9497b9124be10bc13b4eb4a7a6177e8f`.
  That run selected the pure smoke branch and skipped the expensive
  pinned-engine build by design.
- A prior compiled Store [rank-6 backup replay](../aichi-2026/agent32-rank6-spare-tag-and-bench-source.md)
  remains distinct positive evidence for the real DCE→Volt Cyclone route
  without this new guard enabled.

## Native pinned Store positive/negative controls (19 October)

The synthetic prepared-state [Store fixture](../../simulation/twinleaf/rank6-manual-attachment-native-fixture.cjs) uses the actual compiled
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` engine. It constructs the
same `Iron Thorns ex TWM` Active, `Thunder Mountain Prism Star LOT` in play
and physical `Double Colorless Energy SUM` in hand, with no extra Energy
attached. A control with `energyPlayedTurn=0` successfully dispatches an
actual `PlayCardAction`, moving the DCE from hand to the Active Energy list.
The companion state differs only in `energyPlayedTurn=state.turn`; a matching
Store action throws **`ENERGY_ALREADY_ATTACHED`**, leaves DCE in hand and
does not add it to the Active Energy list. The owner-hand planner and native
pre-dispatch helper make the same legal versus blocked distinction.

The existing manual-only workflow gained the additional
`native_energy_probe:true` gate (commit `6a9a4d0`) with a separate
five-minute-bounded checkout, pinned compilation and single-fixture run.
[GitHub Actions 39330128863](https://github.com/FlareZ123/experiment-01/actions/runs/39330128863)
**passed** at exact source SHA
`6a9a4d0abf668fd438246e02ff4f734295fe5e6b`.
The fixture source was committed as `72573db2`. The unmodified workflow
default still runs the existing broader integration suite when neither small
probe input is selected.

This native test gives a real accepted/rejected Store action pair and verifies
correct post-state physical card locations. It is a **synthetic prepared
state**, with no source-dealt opponent, full GX/setup sequence, official match
clock or genuine policy-controlled complete game. It establishes the narrow
attachment rejection that motivated this guard, and cannot qualify any game
for win-rate inference.

## Rejected-action Store observer correction

Follow-up [native Store live-backup audit]
(agent32-store-rejection-live-backup.md) confirmed
[CI 39332435517](https://github.com/FlareZ123/experiment-01/actions/runs/39332435517):
the pinned reducer deep-clones state on a rejected action and restores
`store.state` to that backup. A rejected DCE or Stadium play leaves
the **continuing** game with its original normal-play allowance
available. Earlier provisional observations of consumed counters
came from references to the discarded in-memory working player
and are superseded. The owner-visible preflight remains useful to
avoid choosing an already blocked or already spent action in the first
place; it is **not** required as a substitute for Store state rollback.

## Qualification boundary

The policy is still default-off, narrow to source rank 6, and built on
owner-visible state. The new CI proves pure decision gating, not actual
Twinleaf rejection or a full game with the guard enabled. Source List
29/32; qualified competitive games zero. A useful next falsification
would prepare a pinned Store source-conserved turn with DCE in hand,
`energyPlayedTurn===state.turn`, and reachable G&H, showing baseline
rejection and preflight veto on *the same* physical state. Extend any
shared cross-archetype setup policy only after checking this and
Supporter/Stadium resource contention in its **actual** complete-game
execution.

`qualifiedForCompetitiveInference:false`
