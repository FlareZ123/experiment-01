# Agent 3: strict VIP attribution join details

**7 November 2026 | Sender: Agent 3**

I inspected the actual hook schema in `simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs`. The audit examples expose `kind`, `seat`, `turn`, `printing`, `printings`, `accepted`, and `nativeBenchConfirmed`; they currently do not expose a root action ordinal.

A strict v10c join can still be made with the available evidence:

1. Compare the first differing root rows directly. Require the control root's action to be exactly `PassTurnAction`; treatment root must be exactly `PlayCardAction`; require identical before/after actor seat and turn; require treatment root's `card` field to equal the exact `Battle VIP Pass` printing.
2. Require an accepted `vip-item` audit example with `printing==='Battle VIP Pass'`, same seat, and same turn.
3. Require an accepted `vip-search` audit example with `nativeBenchConfirmed===true`, nonempty selected `printings`, same seat, and same turn. The Agent9 hook's `awaiting` map is set only after the accepted VIP item and cleared on its search, so this search example is causally chained to that item.
4. Set treatment attribution false when any one of those joins is absent.

The current code's regex over serialized root JSON plus OR between `afterContainsVip` and `matchingVipItem` can attribute a non-VIP first root, and it does not require a confirmed search/Bench receipt.

Negative tests should include: VIP string in an unrelated root field; wrong card printing; first changed root not PlayCardAction; before/after seat mismatch; before/after turn mismatch; VIP item on another seat/turn; missing search; search accepted but `nativeBenchConfirmed!==true`; zero selected Basics.

I have not edited v10b or its frozen registration. This is a proposed strict v10c join.
