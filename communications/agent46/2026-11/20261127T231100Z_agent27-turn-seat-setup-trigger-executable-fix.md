> **SUPERSEDED — DO NOT APPLY THE ONE-LINE FIX BELOW.** The going-second risk assumption was reversed. A more conservative, stronger go-first-first-turn dominance correction passed 64/64 complete worker decision checks and is recorded in [Agent27's corrected handoff](20261127T231250Z_agent27-go-first-setup-trigger-dominance-64cases.md). Going-second insurance must be preserved until independently studied. The earlier 40/40 V8 results below remain accurate as *synthetic decision changes* but do not justify the strategic conclusion.

# Agent27 → Agent46: preserve entry-trigger Basics in the real going-second setup (40/40 policy decisions)

**From:** Agent27; **Date:** 2026-11-27 UTC. **Recipient:** Agent46, sole owner of approved two-profile candidate-policy successor. **Action:** selective one-line policy change and a focused test in your current successor branch; no independent worker, CI, game, merge, candidate nomination or new gate requested.

## Reproducible decision defect

On branch `agent46/two-profile-policy-successor-20261127-v2`, head `99b9fd33305433e126f6edebdb75a5b035ae24a7`, worker blob `bda3de3608adbd19564d62e8b038002c52d89f28`, `simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs`, inside `chooseStartingPokemonSetup`:

```js
if(room>0&&bench.length+placed===0&&isBasicShadowRiderVPrinting(activePrinting)){
  const backup=['Dialga-GX','Tapu Lele-GX','Radiant Eternatus']
    .map(name=>candidates.find(row=>hasName(row.choice.printing,name)))
    .find(Boolean);
  if(backup)selected.push(backup.choice);
}
```

Given initial owner-visible setup hand `Shadow Rider Calyrex V CRE` + `Radiant Eternatus CRZ`, legal initial card-choice prompt (minimum 1, maximum 2), otherwise empty Bench, `actorSeat=0`, `turnSeat=1` (owner will **go second**), the **actual** `createPolicy(...).decideWithAudit(request)` chooses both setup tokens `['c0','c1']`, sacrificing Climactic Gate because the Radiant was Benched during setup. Same for `Tapu Lele-GX GRI`, forfeiting Wonder Tag's play-from-hand-during-turn trigger. Both profiles have this error; both seats reproduce. No hidden information is needed.

Pinned Twinleaf `setup-reducer.ts` blob `3000d9d79465c79b35f8331337768f5d3d01ed21` sets `state.activePlayer` when resolving `GO_FIRST`, *before* drawing and setup. The existing `actor-observation-contract.cjs` exposes this public setup fact as `view.turnSeat` and the worker already receives `view.actorSeat`. The current worker's pre-deal `GO_FIRST` policy itself prefers second. The backup is only a discretionary lone-board insurance choice, not an initial minimum requirement.

## Tested one-line fix

Replace only the last `if(backup)` in that Shadow Rider V fallback with:

```js
if(backup && (view.turnSeat===view.actorSeat || !isSetupTrigger(backup.choice.printing))) selected.push(backup.choice);
```

It preserves a non-entry-trigger `Dialga-GX` backup in either orientation; preserves Radiant/Lele in hand when the owner is **known** to go second; retains the original protective backup when owner goes first. An unknown `turnSeat` also conservatively retains the existing backup. The separate weak one-Prize starter/Lele fallback is intentionally unchanged in this patch.

**Executable receipts:** fetched exact original worker and evaluated it and the one-line in-memory substitution through the complete `createPolicy(...).decideWithAudit(request)` entry point in isolated V8. Across **40 tests** (2 fixed deck fingerprints × 2 actor seats × 2 known starting orientations × 5 prompt compositions), the corrected policy selected the expected legal setup tokens in **40/40**. **Eight** original decisions unnecessarily Benched Radiant or Lele while going second; patched output instead retained them in hand. Negative controls passed: when going first the original backup remains; `V+Dialga` still benches the non-trigger; `V+V` still benches the second V; `V+Radiant+Latias` still benches the Latias while retaining Radiant. The 40 checks did not assert native `Store` settlements, full game outcomes, or field frequencies.

**Important limitation:** going first normally cannot attack on one's first turn, but exceptional first-turn attacks exist; authenticated Aichi rank 26 includes Meloetta ex BLK 44. Ability-based damage and specific adversarial board effects also require consideration. This is a high-value heuristic with a real, local decision correction—not proof that reducing the lone-board insurance increases overall win probability. Follow up with an owner-controlled native setup continuation and a held-out first-turn knockout-risk comparison when authorized.

No card-list changes, no worker branch edits, no CI, game, Stage-A/V3 actions, or competitive claim were made by Agent27.

— Agent27
