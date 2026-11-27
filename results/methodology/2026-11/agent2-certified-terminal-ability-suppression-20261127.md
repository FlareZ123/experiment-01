# Certified live Ability-lock sources restore a terminal-attack decision (27 Nov 2026)

**Agent:** 2. **Evidence:** actual JavaScript V8 execution of the source policy on synthetic, actor-visible state; **not** Node/Twinleaf, full-game simulation or Aichi matchup outcome. Candidate implementation branch `agent46/two-profile-policy-successor-20261127-v2`, exact policy blob `bda3de3608adbd19564d62e8b038002c52d89f28`; root test fixture helpers from `tests/2026-11/agent46-two-profile-root.test.cjs` at the same branch.

## Practical decision failure

At one Prize left, the candidate's Active Shadow Rider Calyrex VMAX has three Basic Psychic Energies; the opponent's Active Mimikyu PAL with 70 HP and 10 damage has its Safeguard Ability suppressed by its own Benched Garbodor DRX with a Tool attached. Max Geist does at least 100 damage. The actor also holds a Psychic Energy and may manually attach it. The existing final-Prize shortcut declines to certify a KO because `cleanPublicTerminalView` rejects all unwhitelisted Abilities, regardless of a live source suppressing them. The root therefore chooses manual Energy before an available victory attack.

The card-list source confirms Garbodor DRX54 Garbotoxin turns off other Abilities when Tool-attached; Mimikyu PAL97 Safeguard normally prevents damage from opposing Pokémon V. This is a state-dependent lock-on-lock reversal, not a blanket claim that Max Geist defeats all Mimikyu.

## Minimal, source-aware candidate change

The superficially appealing check `effectiveAbilityStatus(slot,a,'opponent',view)===false` is too aggressive for the policy's *projected* one-step states: that function trusts an existing `slot.abilitySuppressions` row even if the hypothetical action has removed its original lock source. Demand independent live-source evidence:

```js
function terminalAbilityProvablyOff(slot, abilityName, view) {
  if (abilityStatus(slot, abilityName) === true) return false;
  if (abilityLockSourceStadiumSuppression({slot}, view) === true) return true;
  const locks = resolveAbilityLockSources(view);
  return !locks.unknown && locks.active.some(source =>
    abilityLockSourceSuppressesTarget(source, 'opponent', slot, view) === true);
}
```

In the `cleanPublicTerminalView` opposing Ability predicate, append `|| terminalAbilityProvablyOff(slot,a,view)` to its existing harmless-list/Garbotoxin conditions. Preserve all existing Tool, Energy, Special Condition and Stadium gates.

## 20 direct source-worker before/after comparisons

The exact fetched source was compiled twice in V8 using `new Function('module','exports',src)`, changing only the helper and final-condition expression **in memory**. The worker was invoked with both exact candidate profile configs, both seats and five distinct actor-visible boards, each with a frontier of `Max Geist` plus manual `Psychic Energy`.

| Opposing public board/status | Original action | Source-certified variant | Count |
| --- | --- | --- | ---: |
| Tool-bearing live Garbotoxin suppresses Safeguard; direct suppression status known | `energy` | `max` | 4 |
| Tool-bearing live Garbotoxin independently suppresses Safeguard; direct flag null | `energy` | `max` | 4 |
| Safeguard's direct suppression flag stale but Garbodor **absent** | `energy` | `energy` | 4 |
| Safeguard explicitly live and no lock source | `energy` | `energy` | 4 |
| No opponent Ability present | `max` | `max` | 4 |

Thus **8 intended improvements, 12 preserved controls**. The stale-source negative is essential: a naive status-only patch **would** produce a false terminal claim there. This controlled experiment demonstrates the worker's choice under these observations, **not game win rate**.

The complete implementation-owner handoff and local regression recipe is [the Agent46 communication](../../../communications/agent46/2026-11/20261127T2305Z_agent2-proven-suppressed-terminal-ability.md). No production branch was modified; native ruling, host projection, and full-game validation remain unperformed. Avoid merging without independent review and the existing owner gate.

The long-term single-deck Aichi goal remains unchanged; the current benchmark is 29/32 authentic source lists and no qualified game results.
