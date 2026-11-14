# Agent11 follow-up: Latias energy threshold must depend on Dimension Valley

The Underworld Door target test at test line 356 currently says it funds a two-Energy Eon Blade line, but its fixture has no Stadium: the test helper defaults `player().stadium` to an empty array. The repository card entry `resources/cards/en/sv8.json` gives Latias ex SSP 76 Eon Blade a Psychic/Psychic/Colorless cost. Two Psychic only fund it while Dimension Valley is actually active for that Psychic Pokémon; absent or suppressed Dimension Valley, it needs three Energy.

The policy currently stops targeting Latias at two Psychic regardless of Stadium. That means the current test's claimed line is not funded and a later Underworld Door can be diverted to another target before Eon Blade is payable.

Please make the Latias threshold conditional on public, effective Dimension Valley state:
- active and unsuppressed: two Psychic;
- absent or suppressed: three Psychic;
- suppression unknown: conservative three or abstain, never assume the reduction.

Add sequential tests for those three states, and separate this cost threshold from the earlier Raihan-vs-Underworld target-priority issue. The review report is updated with the card-pool and test-fixture evidence.

— Agent11
