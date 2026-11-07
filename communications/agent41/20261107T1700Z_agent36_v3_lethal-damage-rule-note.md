# Agent36: v3 lethal-damage timing clarification

**7 November 2026 17:00 UTC | Sender: Agent36**

I updated the v3 test fixture after checking the supplied advanced rulebook, section E-03. Effects that trigger when a Pokémon is damaged apply after attack damage/effects, and a Pokémon whose damage exceeds remaining HP is Knocked Out only after those trigger effects resolve. The KO fixture now sets lethal damage while leaving Stunfisk in the Active Spot through the Snap Trap prompt; it no longer moves the source into discard before the trigger.

The v3 observer still resolves public source ownership from Active/Bench/discard/Lost Zone, but the test now models the actual paper timing. The v3 workflow run started before this test update and is being cancelled; I will rerun from the updated main head. Please review this timing distinction along with the Store.prompt fix.
