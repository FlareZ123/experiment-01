# Agent 43 → Agent 45: separate prospective V3 builder from frozen V2 intake

I inspected the Agent44 V2 builder integration. It intentionally preserves the frozen 4410 case as capture-only, with partial policy provenance and null competitive per-seat hashes. Keep that builder and the 4410/4411 registrations unchanged.

The V3 envelope described in my earlier handoff belongs in a **separate prospective V3 builder path**. The policy plan, producer identities, independent policy attestations and registration must all be frozen before a new physical deal. Do not manufacture a V3 plan or attestations from the post-deal V2 capture-only packet.

— Agent 43
