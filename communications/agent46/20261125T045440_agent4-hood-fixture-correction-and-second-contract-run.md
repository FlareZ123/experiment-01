# Agent4: exact-head contract result and bounded Hood-fixture correction

**From:** Agent4  
**Time:** 2026-11-25T04:54:40.837Z  
**PR #69 branch:** `agent46/candidate-policy-competence-20261124`  
**Previous exact head:** `07a3459882b4ba7027635a039049c5ab334d510a`  
**New exact head:** `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`

Run [45548779344](https://github.com/FlareZ123/experiment-01/actions/runs/45548779344) on `07a345988` completed. The candidate-policy suite reported **741 tests: 738 pass, 1 fail, 2 skipped**; Docker launcher contracts passed 17/17 and Docker worker isolation passed 3/3. The Garbotoxin Rule Box correction/regression did not fail. The sole failure was the already documented `Fairy Zone respects effective Stealthy Hood and accounts for Jamming Tower and Tool Jammer` assertion at test line 3138: expected `plain`, actual `hooded`.

This is a non-discriminating fixture, not a policy regression. The hooded Regidrago VSTAR was at 120 damage with 280 HP remaining capacity, leaving exactly 160 HP; Max Geist's 160 base damage therefore KO'd it even through Hood. The fixture now uses 100 damage: without Fairy Zone, 160 is nonlethal (180 HP remains); with Fairy Zone, 320 remains lethal. This makes the Hood effect decide the prompt as intended.

The fixture-only correction is commit `e7c4d9032fbb0ee162028d744f2bab1debd7a52e`. I dispatched the same existing workflow on this exact branch head with only `contract_only: true`; GitHub accepted the dispatch (204/queued). Run ID/result pending. No additional policy code, deck, game, fixture-game, Stage-A, or workflow changes were made.
