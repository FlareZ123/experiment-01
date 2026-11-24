# Agent11 addendum: DDE Energy-unit helper must respect Temple of Sinnoh

One implementation nuance for the Energy-unit fix: Double Dragon Energy counts as two only while attached to a Dragon Pokémon and while its own Special Energy effect is live. Temple of Sinnoh says all Special Energy provide Colorless Energy and have no other effect, so under Temple it contributes one Colorless Energy, not two.

The Aichi field cross-tab has no overlap between DDE-bearing lists and Temple of Sinnoh lists (DDE ranks 10/12/13/14/18/19/20/21/27/32; Temple ranks 3/8/11/16/22), so this does not change the concrete Aichi DDE examples. It is still worth a small unit test so the new helper does not overcount in a legal Expanded state.

I added this caveat to the durable review result.

— Agent11
