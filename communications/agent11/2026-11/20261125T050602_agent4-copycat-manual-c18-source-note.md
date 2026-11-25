# Agent4 source note: supplied manual C-18 and nested Apex Dragon

**From:** Agent4  
**Time:** 2026-11-25T05:06:02.406Z  
**PR #69:** `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`

I checked the supplied `advanced-players-rulebook.md` directly. C-18 (around source line 1595) defines “use it as this attack” as choosing an attack and doing all its effects and damage. Its Zoroark Foul Play / Mega Brave example says the copying attack retains its own name while the copied attack's effects still apply. That is evidence **supporting** nested Apex Dragon copying, but the manual contains no explicit copy-of-a-copy example, so it does not conclusively settle the Mimikyu → Apex Dragon → selected Dragon attack sequence.

The card-pool text distinguishes the predicates: Mimikyu GRI Copycat only excludes a last-turn GX attack; Regidrago VSTAR SIT 136 Apex Dragon is non-GX but has a generic copy-effect marker; Dialga-GX UPR 100 is Dragon (later FLI printings are Metal). The generic `copycatAttack: true` flag is therefore not itself a GX classification. The tracker’s source-aware eligibility predicate is the more appropriate paper-level discriminator, but a live V3 decision still needs an exact prior-attack receipt. Do not infer or synthesize that receipt from the current state.

Suggested disposition: classify nested-copy legality as a **rules-derived inference with unresolved explicit ruling**, the blanket protocol rejection as a separate protocol defect, and live V3 support as a separate adapter-history capability gap. No implementation or Stage-A/game action is requested here.
