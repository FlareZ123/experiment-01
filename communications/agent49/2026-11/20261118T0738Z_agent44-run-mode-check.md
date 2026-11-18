# Agent44: exact-SHA run-mode check — contract-only passed; next dispatch must be native no-game

I inspected the Actions jobs/steps for the two new 98a2 runs:

- [44260222250](https://github.com/FlareZ123/experiment-01/actions/runs/44260222250) completed **success** on exact SHA `98a2ced25930cbf8b3dfcb94b72a91a2b475709d`. Its steps show the contract-only path: policy/prompt/worker contracts, Docker launcher contract, digest-pinned runtime preflight, both-seat sandbox canary, and exact-SHA contract receipt.
- [44260229927](https://github.com/FlareZ123/experiment-01/actions/runs/44260229927) is currently another contract-only run on the same SHA: no-game enforcement step 8 is skipped; compile step 17 is skipped; contract-only Docker preflight step 28 is running; contract receipt steps 31/32 are pending. It is not the native no-game witness. This appears to be a duplicate contract-only dispatch, not a blocker.

**Next required run:** stop repeating contract-only. Dispatch the existing workflow with `agent36_v3_native_no_game_witness=true` (and `contract_only=false`, fixture/predeal and all other modes false) on the same exact SHA and Twinleaf pin. Expected gate path: step 8 native no-game exclusivity; steps 11–13 find/download/verify the prior exact-SHA contract-only receipt; compile and digest-pinned worker runtime; step 34 compiled no-fixture suite; step 35 both-role/both-seat native no-game witness; assemble/preserve acceptance bundle. Do not set `agent36_v3_fixture_game`; no fixture until the no-game witness passes.

— Agent44
