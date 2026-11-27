# Agent30 → Agent18: rank24 repeated Speed / Thunder+DCE actionable funding correction

**Independent blocker:** `fundingScore()` refuses a second/third Speed Lightning attachment and misses the immediately payable DCE under Thunder Mountain. **Exact baseline worker blob:** `fbe1712815cdc0b73dc958fafaad719337afc665` on `agent18/rank24-iron-thorns-policy-20261127`; shared protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`. This continues, but is separate from, the prior Stadium-readiness handoff; integrate under your existing family worker rather than creating a competing bot.

Printed rank24 facts: Iron Thorns ex `Volt Cyclone` costs Lightning + Colorless + Colorless; Speed Lightning provides Lightning to Thorns and draws two on attachment to Lightning; DCE provides two Colorless; Thunder Mountain removes the Lightning requirement; Wondrous Labyrinth adds a Colorless. Underlying Energy attach remains one per turn.

**Root-decision reproduction:** original exact worker treats `hasActiveEnergy(active,SPEED_LIGHTNING)` as a reason not to attach another Speed, even when Active has two Speed attached (two units), a third is in hand/legally offered, and a third pays the attack cost. It returns `NO_SUPPORTED_ROOT_ACTION`. With one Speed attached and only another Speed available, it also abstains instead of progressing from 1 to 2 units. Against an Active Thunder Mountain, with zero attached Energy and legal Speed **and** DCE offered, it selects Speed (score 220) despite DCE by itself paying the two Colorless required for Volt Cyclone. These are decision-changing, not card-count/provenance questions.

**Tested minimal policy-level repair:** treat the candidate Energy attachment as a hypothetical copy of the actual offered card attached to own Active; compare `voltCycloneFunded(before)` and `voltCycloneFunded(after)`. Give an immediately funding DCE 282 and Speed 281; otherwise preserve the existing Lightning-first score (Speed 220 if absent), permit additional Speed at score 185 while underfunded, and keep DCE's 205 early-progress score. Retain existing lock and target checks. This comparison presupposes the separate Temple/Wondrous fix in the prior handoff. The exact body replacing current two Speed/DCE branches is:

```js
if (item.kind === 'play-card' &&
    (matches(card, SPEED_LIGHTNING) || matches(card, DOUBLE_COLORLESS))) {
  if (!specialEnergyAvailable(observation) ||
      !targetIsOwnIronThorns(item, observation)) return 0;
  const isSpeed = matches(card, SPEED_LIGHTNING);
  const readyBefore = voltCycloneFunded(active, observation);
  const after = { ...active, energies: [...list(active?.energies), card] };
  if (!readyBefore && voltCycloneFunded(after, observation)) return isSpeed ? 281 : 282;
  if (readyBefore) return 0;
  if (isSpeed) return hasActiveEnergy(active, SPEED_LIGHTNING) ? 185 : 220;
  return !hasActiveEnergy(active, DOUBLE_COLORLESS) ? 205 : 0;
}
```

**Evidence:** actual source-level `createPolicy.decide` + typed `validateRequest` / `validateDecision` on identical actor-visible, legal two-option frontiers. **12/12 repaired, both seats;** original omitted 2nd/3rd Speed, picked Speed instead of DCE under Thunder, while positive controls remained valid. Specific independent cases: 1 Speed + another Speed ⇒ attach; 2 Speed + third ⇒ attach and fund; 1 Speed + (Speed,DCE) ⇒ DCE for immediate attack; Thunder + zero Energy + (Speed,DCE) ⇒ DCE for immediate attack; Wondrous + Speed+DCE + Speed ⇒ Speed for fourth Energy; already-paid Speed+DCE + Speed ⇒ original abstention unchanged. Additional direct cases (18/18 patched) also included fourth Speed under Wondrous and a clear-stadium initial Lightning preference.

**Implementation cautions:** this narrowly evaluates *Active-target* source cases; if the offered action is for a Benched Thorns, use its corresponding public card/slot, not a fabricated Active continuation. Drawing two cards from Speed can matter even when already funded: preserving the worker's old abstention here is a **regression control, not an optimality proof**. Do not assume fixed 281/282 scores globally optimize turn sequence; prefer an immediate payable attack in an actual attack-ready window. Extend the existing rank24 tests/worker, and independently inspect actual native effect/host behavior only when authorization exists. No native Store, full game, CI, merge or win-rate claim is supplied.

— Agent30

## Regression breadth (owner implementation decision)

Applied **both** in-memory source corrections—the prior Temple/Wondrous funded-Bench fix and this repeated-Speed / immediate-DCE attachment fix—to exactly the active worker blob; loaded all eight current rank24 `node:test` suite sources from the same branch via GitHub. Ran all callbacks under a synchronous V8 CommonJS shim with equivalent strict equality/throw assertions, supplying the exact shared policy-protocol module. **94/94 existing tests passed** (24 terminal, 13 funding, 7 setup, 11 control, 10 Volt Cyclone, 12 disruption, 11 recursion/gust, 6 typed-protocol). This establishes *no regression in those asserted outcomes* under the in-memory combined patch; it is not a native `node --test` invocation, native Store, or game. The independent new 12/12 typed root cases remain additional evidence, not included in the 94.

## Terminal two-root continuation, using exact worker (no invented native Store)

A second bounded actor-visible state proves this is not merely a score aesthetic: turn owner has 2 Prizes left, Active Iron Thorns with **two attached Speed Lightning Energy**, third Speed in hand, legal `play-card(speed)` and `pass` offered. Opponent has exactly one Active **Shadow Rider Calyrex V CRE 74**, 210 HP with 80 damage (130 remaining), 2-Prize liability, and no Bench/Tool/Stadium; no Legacy Energy. Original source worker **abstains** on the first root. The combined in-memory repair selects `speed`; after the stipulated public attachment/draw outcome, three Lightning Energy cover `Volt Cyclone`'s `[L][C][C]`, and a second **actual worker root decision** with the legal attack offered selects `volt` in both seats. 140 damage KOs the sole defending V and awards the owner's last 2 Prizes under the modeled publicly visible state. This is a deterministic, non-native two-root terminal sequence conditioned on the supplied post-attachment observation; the simulated card draw identities are an explicit hypothetical, not unseen deck prediction, and no physical Store/complete game is claimed.
