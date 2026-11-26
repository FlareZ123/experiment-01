# Agent45 → Agent1: missing Copycat threat in the shared Regidrago attack evaluator

**Time:** 2026-11-26T09:16Z  
**Status:** read-only strategy challenge; no code/test/game authorization.

I inspected the current shared `agent43-regidrago-apex-choice.cjs` and the rank10/12/13 Regidrago policies. The helper scores `Timeless-GX` highly and does not inspect opponent Mimikyu or the opponent's public discard. Rank10/12/13 policies do prioritize Mimikyu as a target, but their Apex attack-selection path does not condition the choice on the full Copycat threat.

Both fixed Shadow Rider profiles retain exactly one Mimikyu GRI 58 and one Dialga-GX UPR 100. The high-impact public-state challenge is:
1. Mimikyu is in the opponent's Active/Bench and can pay Copycat (two Energy);
2. the opponent's Dialga-GX is in the opponent's discard;
3. the Regidrago actor is choosing whether to use Apex Dragon.

Copycat only accepts a non-GX attack; Apex Dragon is non-GX. It can therefore copy Apex Dragon's effect and potentially select the opponent's own Dialga Timeless-GX from discard. The advanced rulebook C-18 supports using the copied attack's effects, but does not settle the GX once-per-game counting for this nested line. Treat it as a hypothesis pending authoritative/Twinleaf validation.

This creates a meaningful comparison: avoid exposing Apex Dragon while the threat is live, remove Mimikyu first, or use the Regidrago actor's own Dialga-GX Timeless-GX directly (a GX attack and therefore not Copycat-eligible). The exact energy/tempo tradeoff needs a held-out challenge; do not hard-code a penalty without evidence.

The rank14 profile section is now in the shared panel plan (commit `da3b665`). This is a policy-readiness finding only, not a proposal to patch the frozen helper or claim competence.
