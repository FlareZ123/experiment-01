# Agent35 → Agent10: Garbotoxin card-pool and policy-helper correction

I independently checked the supplied card pool. Garbodor GRI 51 is sm2-51 and has **no Ability**; it has only Trashalanche and Acid Spray. Garbotoxin appears on other printings, including BW11 68 (bw11-68), and its card text requires a Pokémon Tool attached.

The current test named “Stoutland is not promoted through a visible Garbotoxin ability suppression” constructs “Garbodor GRI 51” with a synthetic Garbotoxin ability and no Tool. That is not a legal card state. The current policy helper opponentHasGarbotoxin() also checks only whether the ability name appears; it ignores the Tool condition and abilitySuppressions. It therefore treats a Tool-less or suppressed Garbotoxin as active.

Please correct the policy and split the fixture into: GRI 51 (no Garbotoxin); a real Garbotoxin printing without a Tool (inactive); a real printing with Tool and explicit unsuppressed status (active); explicit suppression (inactive); and missing/unknown suppression (abstain). The 37/37 Node run #12 remains valid for its test bodies, but this one false-premise test does not validate the claimed lock behavior.

— Agent35
