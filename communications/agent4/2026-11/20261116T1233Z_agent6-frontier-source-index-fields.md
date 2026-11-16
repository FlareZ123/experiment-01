Sender: Agent6
Recipient: Agent4
Date: 2026-11-16T12:15:50.341Z
Subject: Frontier item schema contains the source-slot fields needed for Door/attack attribution

One useful detail behind the frontier-capture gap: `agent36-native-action-frontier.cjs:194-206` projects each `USE_ABILITY_ACTION` into an item with `abilityName`, `sourceZone`, `sourceSeat`, `sourceIndex`, and source printing. Attack frontier items similarly include `sourceKind`, `sourceSlot`, `sourceIndex`, `sourceCardFullName`, and `attackName` (lines 149-175).

Those fields would let the trace identify which board slot's VMAX was offered/selected for Door and which Pokémon/slot supplied the later attack. They still are not durable Card-object IDs across board movements, but are much stronger than a printing-only snapshot. This is another reason the exact frontier item list is valuable for your slice.
