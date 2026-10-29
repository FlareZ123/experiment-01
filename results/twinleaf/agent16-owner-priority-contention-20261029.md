# Agent 16: enabled-option first-return contention in the shared actor policy

**29 October 2026. Read-only, opt-in research instrument; no native opportunity or win claim.**

## Scope and source-grounded counterexample

The actual `chooseActorRootIntent` in
[`simulation/twinleaf/agent34-actor-only-root-policy.cjs`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs)
chooses its first supported root. A payable printed attack is reached before
the optional Special Energy and held Guzma/Marnie frontiers. This is a static
source-code ordering fact and could be tactically justified in many states.

A reproducible **hypothetical owner-root state using printings in one actual
original Top-32 deck** demonstrates a genuine *policy-selection conflict*.
The verified [29-source manifest](../aichi-2026/full-decklists.json) records
rank 3 Snorlax Stall with one `Girafarig LOT` and **three**
`Capture Energy RCL`. The supplied English card snapshot identifies
Girafarig LOT as SM8 94, with `Get Lost` costing **one Colorless**
and `Mind Shock` costing **three Colorless**.

In the deterministic pure regression, the Active Girafarig already has
one Capture attached, the owner has a second Capture in hand, it is an
otherwise unspent Energy-attachment turn, and the first attack is payable.
With `specialEnergyRoot:true`, the unmodified actual chooser returns
`{kind:'attack',attackName:'Get Lost'}`. An independent call to the
*existing* numeric Special Energy heuristic on **that same detached actor
observation** offers an additional Capture attachment because it improves
the printed three-Colorless attack deficit. This lower-priority action
would be skipped on the current turn once Get Lost is used. The new
instrument reports `attack > attach-special-energy` with reason
`turn-ending-selection`.

**These are hypothetical board and hand conditions, not a naturally
observed rank-3 match, a native legality ruling, or a judgment that attaching
Capture is preferable to using Get Lost.** Opponent discard contents,
the actual Capture on-attachment Basic search, attack target prompts,
future opponent decisions and clock opportunity costs must be settled in
the pinned Store and evaluated strategically. This test does establish
that distinct printed objectives can compete in the present first-return
policy when its optional numeric Energy capability is enabled.

## Implementation and reproducibility

- New partial same-root observer:
  [`agent16-owner-priority-contention.cjs`](../../simulation/twinleaf/agent16-owner-priority-contention.cjs).
- Genuine owner-root integration in the already shared actor:
  [`agent34-actor-only-root-policy.cjs`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs).
- Pure regressions, including direct use of **actual chooser and actual
  Special Energy selector**:
  [`tests/agent16-owner-priority-contention.test.cjs`](../../tests/agent16-owner-priority-contention.test.cjs).
- Existing **manual-only** statistics workflow includes this file;
  no new workflow was created. Its prior [full test run
  40962023479](https://github.com/FlareZ123/experiment-01/actions/runs/40962023479)
  passed at an earlier test revision using the same cost relationship with
  Arceus V and DCE. The latest rank-3 exact-printing change needs its own
  workflow confirmation; do not misattribute the earlier green run to it.

Set `AGENT16_OWNER_ARBITRATION_CENSUS_DEV=true` in a **genuine**
owner-actor Store experiment to enable the observer. With the flag absent,
the added fields are deleted from the outgoing audit to retain its original
shape. It **does not change the original action selection or dispatch**.
The same `rootOptions` object is supplied to both the real first-return
chooser and the independent probe. It only probes **enabled**
lower-priority existing optional families, and filters exhausted Energy
turn quotas. Every candidate is recorded as `nativePlayability:
'unverified'`; none is counted as a missed *legal* action.

The present partial vocabulary covers low-hand Lillie, conservative
shuffle Supporters, VS Seeker to Lillie, Carmine, two existing Special
Energy models, held Guzma mobility and stranded Marnie. It does not
enumerate every Item, Ability, Trainer target, stadium, evolution,
switch/retreat or every possible cost; the rank map is provisional and
must be updated when the shared chooser is reordered. Unknown earlier
kinds fail closed rather than silently claiming a conflict. Duplicate
exact physical proposals are collapsed. Audits cap sampled receipts at
40 while keeping aggregate kind/reason counts.

Potential conflicts are classified conservatively:
`turn-ending-selection`, `same-turn-energy-attachment`,
`same-turn-supporter-quota`, or `later-root-may-recover`.
The last class **must** be followed into a later root before calling it
lost. Actual legality, benefit and completeness are all unknown until
native Store positive and negative forks, physical action targets,
continuation, source response and strict witness checks.

## Qualification and next experiment

Use the existing canonical bilateral runner with **both physical seats**
and a fixed exact print/engine/policy revision. First run an on/off
**observer noninterference test**, comparing source deals, root actions,
physical recipients and unchanged game outcomes. Then register natural
multi-action owner roots in rank 3 or another existing original source
and find genuine opponent-discard/Bench/attachment positive controls.
Fork the **same physical deal** into attack versus attachment, settle
their printed effects and an opponent reply, including all caps and errors.
Only then consider adding a ranked chooser or proving that an apparent
conflict is recovered by a subsequent root. The evidence has no
competitive outcome implications until all shared two-player and
clock-qualification gates pass.

**Status:** 29/32 exact source 60s recovered (ranks 23, 25 and 28
missing), zero competitive-qualified games, no final fixed-60 winner,
no demonstrated 99.5% win rate.
