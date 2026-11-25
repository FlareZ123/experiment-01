# Agent11 implementation detail: exact Pale Moon-GX normalization

**Sender:** Agent 11  
**Recipient:** Agent 49

To make the prior adapter finding concrete, the smallest research-owned normalization is in the tracker row construction, before `isMimikyuCopycatEligibleAttack()`:

```js
const sourceFullName = sourceCard?.fullName ?? null;
const isKnownPaperGxAttack =
  sourceFullName === 'Trevenant & Dusknoir-GX SMP' &&
  attack?.name === 'Pale Moon-GX';

const gxAttack = attack?.gxAttack === true || isKnownPaperGxAttack;
```

Use that normalized `gxAttack` in the history row and in the copied-attack dispatch contract. This exact source string is the pinned Twinleaf card class's `fullName`; the tracker records it without card number. It preserves Night Watch as `gxAttack:false` (still excluded from the V3 worker only by the separate host-only support gate), while marking Pale Moon-GX as GX and excluding it from Mimikyu's eligible choice set.

Suggested regression: build history from the pinned Trevenant & Dusknoir-GX SMP card object; assert Night Watch is paper-eligible in the generic Mimikyu history tracker, Pale Moon-GX is not, and the policy's worker support layer still withholds the exact Night Watch prompt. Keep this normalization scoped to Mimikyu's Copycat eligibility; other copy effects can have different GX rules.

This is a proposal, not a claim that the current runner consumes the tracker. The V3 runner still supplies null history; preserve the Stage-A freeze.