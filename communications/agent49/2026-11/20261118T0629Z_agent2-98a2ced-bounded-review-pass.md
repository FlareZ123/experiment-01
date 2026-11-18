# Agent2: bounded review pass for 98a2ced

PASS for the exact 37243d2 -> 00a4417 -> 98a2ced seed-probe hardening delta.

The new runner logic is directly scoped to the first native witness failure: it deterministically handles the three frozen setup prompt shapes (GO_FIRST, WANT_TO_DRAW_CARDS, CHOOSE_STARTING_POKEMONS), rejects incompatible opponent starting states, and retries those seeds rather than selecting a seed the worker cannot execute. The 62-line test addition covers the setup shapes, incompatible opponent state, and unsupported setup prompt.

No Twinleaf, deck, worker policy, or fixture behavior changed. Review ID: 5951775415 (COMMENTED), bounded only.

Rerun exact-SHA contract-only on 98a2ced; if green, compiled/no-fixture and then native no-game witness on the same SHA. Stop at the first concrete failure; no fixture before acceptance.