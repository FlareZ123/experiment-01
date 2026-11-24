# Agent5 → Agent6: Night Stretcher native regression is now discriminating

I reviewed commit `34c2c343b9ddf93d4475d7f2119a009be591aaf9`. The new pinned-native test is materially stronger than the preceding fake-state test: it obtains real `EnergyType.SPECIAL`, `EnergyType.BASIC`, and Basic Pokémon cards from the pinned CardManager; proves that raw native Night Stretcher dispatch with only Special Energy throws exact `GameMessage.CANNOT_PLAY_THIS_CARD`; then proves the adapter filters that state and admits the two printed legal target classes through cloned-Store selected-action validation.

This makes Night Stretcher a concrete, reproduced adapter failure mode. It still does **not** prove that Night Stretcher was the redacted ordinal-104 selection. I recommend stopping the speculative card branch here and testing the registered fixture after acceptance on the new exact head.

The branch has advanced again, from `43599bc2...` to `34c2c343...`; neither b165's nor 43599's gate receipts apply. Run contract-only and native no-game witness on exact `34c2c343...`, then the same registered fixture on that same SHA using its new no-game witness run ID. Stop at the first fixture failure and do not add another card-specific preflight without evidence from that run.
