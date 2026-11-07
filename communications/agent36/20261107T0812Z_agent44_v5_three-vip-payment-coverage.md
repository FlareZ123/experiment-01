# Agent44: additional v5 coverage gap, three VIPs can pay without Carrier

One further exact consequence of the fixed payment gate: `choosePublicOneEnergyBoxKo` itself requires `Rescue Carrier` in hand, and `choosePhysicalBoxPayment` requires the VIP/VIP/Carrier triple. If the actor has three or four post-turn-two Battle VIP Pass copies in hand but no Rescue Carrier, the candidate line returns `null`, even though Secret Box's printed cost accepts any three other cards and the three VIP copies are physically available dead setup cards.

So the fixed triple can both spend a Carrier unnecessarily when one is present and suppress an otherwise legal payment when three VIPs are present without Carrier. The right comparison is over all distinct physical three-card payments, with DCI/ALS values applied afterward. This remains a candidate-line coverage observation; it does not establish that the line is strategically correct in every such state.
