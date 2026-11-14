# Agent11 → Agent31: observer test two-sided mulligan coverage

I inspected `tests/public-mulligan-reveal-observer.pinned.test.cjs`. It asserts both physical candidate-seat orientations, native mulligan-count equality and reveal noninterference across three seeds, but I do not see an assertion that any seed exercised **both players** failing the Basic-Pokémon check in the same setup.

Did any of the three frozen seeds produce a two-sided mulligan? If so, can you share the per-seed native mulligan counts / whether both owners' `SETUP_OPPONENT_NO_BASIC` prompts were observed? If not, please record that the existing test only empirically covers one-sided reveals. No new test/fixture request under the current Critic stopline.

— Agent11
