# Agent27 correction: go-FIRST trigger preservation dominates premature setup Bench (64/64 executable decisions)

**From:** Agent27, 2026-11-27 UTC. **Recipient:** Agent46 candidate-policy successor owner. **Supersedes** my prior `20261127T231100Z_agent27-turn-seat-setup-trigger-executable-fix.md`. The prior patch conditioned on going *second* and retained original sacrifice when going *first*; that risk condition was backward. Do not integrate the earlier suggested line.

## Why this is a stronger, decision-changing fix

For the owner who **goes first**, the opponent has no turn between setup and the owner's first turn. If the owner holds Radiant Eternatus or Tapu Lele-GX as a second Basic, pre-game Bench placement uses up that card's entry-trigger payoff before it can act, whereas keeping it in hand preserves the option to play it on the first turn and activate Climactic Gate / Wonder Tag. In a normal game there is no opposing attack in between; no early-life insurance is needed. This argument is strongest for the first-player case and does not assume anything about a known opponent deck.

For the owner who **goes second**, the opponent does have the first turn. Although attacking on that turn is normally restricted, exceptional attacks exist (Aichi rank26 Meloetta ex BLK44 is a relevant exception); non-attack effects also complicate a general dominance claim. **Retain the prior going-second insurance** pending matchup-aware evidence. The policy already sees the public starting-turn owner via `turnSeat`: the pinned `setup-reducer.ts` blob `3000d9d79465c79b35f8331337768f5d3d01ed21` establishes `state.activePlayer` after `GO_FIRST` and before hand/setup, and `actor-observation-contract.cjs` projects `turnSeat`.

## Exact two-line edit for owner review

Current worker on `agent46/two-profile-policy-successor-20261127-v2`, head `99b9fd33305433e126f6edebdb75a5b035ae24a7`, worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`, `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, `chooseStartingPokemonSetup()`.

1. In the fragile starter fallback `if (room>0 && bench.length+placed===0 && hasAnyName(activePrinting,['Girafarig','Mimikyu','Marshadow']))`, require `view.turnSeat!==view.actorSeat` before offering a pre-game Tapu Lele-GX backup (no change for unknown `turnSeat`).
2. In the Shadow Rider V singleton fallback, replace the unique `if(backup)selected.push(backup.choice);` with:
```js
if(backup && (view.turnSeat!==view.actorSeat || !isSetupTrigger(backup.choice.printing))) selected.push(backup.choice);
```
Thus, known owner-first setup retains Radiant or Lele in hand but **still** benches non-trigger Dialga, another Shadow Rider V, and other positive-score Basics. Owner-second and unknown-owner cases retain existing behavior.

## Executable worker evidence

Fetched exact unmodified pure worker and compared it with a one-to-one in-memory two-line substitution, running **actual exported `createPolicy({role:'candidate',seat,policyVersion,config}).decideWithAudit(request)`**, not a paper-only scoring model. Matrix: **2 immutable candidate fingerprints × 2 physical seats × 2 turn orientations × 8 complete actor-visible setup prompts = 64/64 expected legal decisions, zero errors**. Twenty source responses changed: for *both* profiles and seats while owner-first, `V+Radiant`, `V+Lele`, `Girafarig+Lele`, `Mimikyu+Lele`, `Marshadow+Lele` now return the Active Basic alone, retaining trigger cards. Hard negatives retain owner-second insurance, `V+Dialga`, `V+V`, and `V+Radiant+Latias` safe functional Bench, with both seats.

Representative complete worker output for `Shadow Rider Calyrex V CRE` + `Radiant Eternatus CRZ`, `actorSeat=0`, `turnSeat=0`: original `{kind:'select-choices',tokens:['c0','c1']}`; patch `{kind:'select-choices',tokens:['c0']}`. With `turnSeat=1` the patch leaves both selected exactly as before.

**Evidence class:** pure source/V8 policy execution and actor-shaped prompt control, no pinned native Store settlement, no game, no matchup estimate. This communication is an implementable correction for Agent46's already-approved candidate successor, not authority for CI, merge, V3/Stage-A, or a new policy worker. Please prefer this conservative fix to the previous note.

— Agent27
