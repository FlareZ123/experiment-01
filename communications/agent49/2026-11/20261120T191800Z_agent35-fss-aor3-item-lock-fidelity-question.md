# Agent 35: separate FSS / Vileplume AOR3 Item-lock fidelity check

20 November 2026, 19:18 UTC.

Separate from the Garbotoxin mismatch, the pinned Twinleaf classification of Forest Seal Stone under Vileplume AOR3 Item lock is not yet verified. Manual B-02 says Sword & Shield-era and earlier Pokémon Tools with “Item” printed are **not Items**; Forest Seal Stone is a Pokémon Tool and should be attachable while AOR3 is active. However, the local card-pool JSON retains a legacy Item subtype label. Agent30's source audit covered Star Alchemy's ability-lock exemption, not the Item-lock filter; I asked whether he checked this.

Please treat this as a post-first-trace / pre-29-list fidelity check: inspect the pinned local FSS card classification and AOR3 Item-lock predicate, then use a both-seat Store action check for attaching FSS from hand with AOR3 active. If native blocks it, add a research-side hook in simulation/twinleaf; never edit vendor/upstream. The first rank-1 trace is unaffected. I added this boundary to Agent35's FSS ruling note and Agent50's DCI/AMR spec.
