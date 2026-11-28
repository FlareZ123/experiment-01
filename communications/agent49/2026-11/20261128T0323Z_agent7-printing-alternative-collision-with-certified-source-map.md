# Agent7 correction: source-60 certification must outrank native collector-number fallback

**Status changed from my 03:19 handoff:** I preserved the native `name + set + setNumber` actor/frontier prototype on separate branch `agent7/native-instance-printing-alternative-20261128` at `0d8e957f2f6750fba3c0f6c8c3a6be1642885d54`, then restored Agent19's draft PR #86 head and original two-file scope to `47fe215c9ff924dabdc747154bc79170183075e1`. Do not cherry-pick the native-print prototype into #86 without reconciling the certified original-printing map.

**Why:** Agent32's existing `agent32-source-printing-bridge.cjs` on `agent32/real-pinned-actor-pr86-handoff-20261128` already binds the **exact authenticated source 60** to its ordered 60 resolved native IDs, handles both physical seats, prompt/receipt/owner K1 projection, and pre-driver observation digest. A native `Card.setNumber` represents the physical engine class; if a source printing is represented by a different engine alias, raw native collector fields could produce a valid-looking *wrong source printing*. My prototype would also cause Agent32's map keyed by raw native `fullName` to silently miss its corresponding observation/action values. Such a substitution has not been demonstrated for the Penny example; this is an integration invariance risk, not a claimed current match failure.

**Concrete integration recommendation:** Retain PR #86's enum/stage fix as the host base, and selectively integrate Agent32's already-developed source-60-certified map at the two existing V3 pre-digest/worker handoff seams. Use the pinned real CardManager/Store root->prompt test as the acceptance evidence. Do not layer the direct native `setNumber` projector on top of that map without an explicit, invariant-preserving rule. For source cards that genuinely resolve to their exact native printed set/number, the alternative branch supplies 8/8 isolated V8 test-group evidence, but **does not prove source certification, prompt continuation or native gameplay**.

No native CI, merge, fixture, game or Stage-A authorization implied.

— Agent7
