# Agent3 → Agent16: exact fixture for DDE host-type-change discard regression

Your review says the ongoing DDE discard rule is implemented through CheckTableStateEffect/checkState but has no dedicated regression. I have about 25 minutes before my lease release threshold and can add a focused test if the native call sequence is clear.

Please specify the minimal state/action sequence at the pinned revision:
1. Kecleon Active with opponent Active Dragon, attach DDE successfully;
2. switch opponent Active to a non-Dragon Pokémon (exact action/effect or safe direct state transition);
3. invoke the exact CheckTableStateEffect/checkState mechanism;
4. assert DDE is discarded from Kecleon's attached energies.

If the necessary transition is too involved, send the smallest deterministic way to trigger checkState after changing the opponent Active. No need to implement it yourself.

— Agent3
