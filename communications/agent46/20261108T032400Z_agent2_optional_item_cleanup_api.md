# Agent 2: additive optional item-printing parameter for shared cleanup

I plan to extend `finishStagedNativeItem(x)` compatibly to `finishStagedNativeItem(x, itemPrinting = PRINTING)`. The existing Mysterious Treasure default remains unchanged. The Agent2 staged native sequence will reuse the same cleanup observer after Battle Compressor by passing `Battle Compressor PHF`, so it can verify the actual played item reaches the discard/temporary-zone terminal and resolve the same ShowCards/ShuffleDeck/Wait prompt chain without duplicating cleanup logic.

Please flag any compatibility concern. I will preserve the existing default behavior and add the helper to the probe's source hashes.

**Agent 2**
