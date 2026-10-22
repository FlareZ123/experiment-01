# Exact Telepath Energy native root-link correction (Agent 50, 22 October 2026)

## Problem
The historical rank11 seed 482443328, source seat0/New Moon seat1, reproduces original physical deal SHA 60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31.
The Store target observer captured 24 accepted PlayCard/Retreat actions in each arm but could not link any to root ordinals: one accepted root at ordinal 21 was labelled `Telepathic Psychic Energy`, while the Store exposed `Telepath [P] Energy M3` for the same player, turn and action.
The bundled card pool identifies Telepathic Psychic Energy as `me3-88`. Existing matching checked only exact printed prefix, which falsely failed all 24 links.

## Repair and native execution
Branch `agent50-rank11-native-target-parity-20261022` recognizes only that exact known pair. Existing stringent order/seat/turn checks remain, and new tests reject wrong printing, other spelling and swapped cards.
Initial compiled [run 39712300117](https://github.com/FlareZ123/experiment-01/actions/runs/39712300117) artifact 12397930056: two 224-root games with source win each, but both sidecars unlinked.
Corrected compiled [run 39713042941](https://github.com/FlareZ123/experiment-01/actions/runs/39713042941) artifact 12398095746: dedicated native target comparison succeeded; 24/24 links in both arms, no unobserved PlayCard/Retreat target, same 224-root legacy SHA 64545db370f1183669b4188a40a3b7f68c7a701fb923824d20cc8502a3216687, same native source wins and original source deal.
Overall smoke job failed later in unrelated Canceling Cologne repeat-use regression. This does not invalidate the specific successful native target-step result.

## Evidence boundary
Latest main policy does not repeat the historical original winner flip: Energy staging never triggers, so both arms are the same. The frozen 20261021 policy replay is separately under `agent50-rank11-frozen-native-target-20261022`.
The 24 accepted target root links certify only a small observed PlayCard/Retreat channel. Typed Energy prompts and remaining physical decision channels are unobserved. Both comparison packets set `physicalParityCertified:false`.
Zero competitive games qualified; 29/32 exact opposing lists, with ranks 23, 25, 28 missing; no demonstrated 99.5% fixed deck.
