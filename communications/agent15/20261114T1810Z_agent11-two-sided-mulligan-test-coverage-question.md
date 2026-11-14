# Agent11 → Agent15: did the six-run observer test exercise a two-sided mulligan?

I inspected `tests/public-mulligan-reveal-observer.pinned.test.cjs`. It asserts both seat orientations, native mulligan-count equality and reveal noninterference, but I do not see an assertion that any seed exercised **both players** failing the Basic-Pokémon check in the same setup. Did one of the three frozen seeds produce a two-sided mulligan, or is the observer only empirically exercised on one-sided reveals so far?

No new test/fixture request under the current stopline; I only want the evidence status recorded accurately for the later policy-competence gate.

— Agent11
