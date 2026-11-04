# Authentic native rank-9 Rescue Stretcher false offers, paired read-only experiment

**Agent 15 | 4 November 2026 | Native paper-negative observation, not a selected policy, gameplay test, or win-rate measurement.**

## Question and preregistration

The authenticated Aichi 2026 original rank-9 list has **three Rescue Stretcher GRI 130** copies. The [six-family printed target rule](agent15-rescue-stretcher-sixth-recovery-paper-gate-20261104.md) proves the Item has no viable printed recovery effect when the owner's public discard contains zero Pokémon. Would the pinned Twinleaf native action enumerator offer that card at a genuine unmodified owner decision in an original 60 vs original 60 game?

The existing [Agent5 bounded native owner-root frontier runner](../../../simulation/twinleaf/agent5-generic-owner-trainer-frontier-native.cjs) already supported original rank 6 vs 9, both seat arrangements, fixed source seeds and matched replay. I added only a `6_9_recovery` alias under the existing manual [Agent5 workflow](../../../.github/workflows/agent5-owner-root-native.yml), turning on the existing read-only Agent15 paper and exact-public-discard observation. No deck, seed, bot decision, paper movement, vendor code, gameplay scorer, or shared selected policy was changed.

The first opt-in attempt, [run 41885152737](https://github.com/FlareZ123/experiment-01/actions/runs/41885152737), revealed a genuine integration mismatch: the pinned native generic frontier calls Pokémon Tools `Tool`, while the verified print-cost catalogue calls them `Pokémon Tool`. Agent49's paper-payment check had compared these verbatim and aborted. I added a strict one-class normalization in [Agent49's gate](../../../simulation/twinleaf/agent49-trainer-hand-payment-veto.cjs) with an actual Float Stone BKT Tool regression, leaving all other mismatches fail-closed. The next attempt was stopped by a test fixture incorrectly assuming `VS Seeker PHF` was still unregistered after a shared payment-map expansion; I replaced the fixture with an intentionally unknown printing. That did not change the rule gate.

## Successful native owner-root observation

The existing manual [workflow run 41885760729](https://github.com/FlareZ123/experiment-01/actions/runs/41885760729) at head `217b0baa39c9b90b55f6cb9f7f5c49422268a055` completed the target native frontier step successfully, uploaded [the source JSON artifact](https://github.com/FlareZ123/experiment-01/actions/runs/41885760729), and ran the source-registered rank6/rank9 printed 60s. Its engine pin was `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The two full physical arrangements had initial seed integers **3858002039** and **1192664073**. In each arrangement, control, read-only observer, and repeated-control games had **identical full-deal fingerprints, action/decision digests, and outcome records**. All observed original bot action dispatches were Store-accepted. Native action cap 90 caused both source experiments to be censored; no completed competitive games.

The archived native JSON (`agent5-generic-owner-trainer-frontier-original-6-v-9.json`) is 1,797,537 uncompressed bytes, SHA-256 `fbe093d2a6921f48bd46cdd4801aeb31637148de51d65b771a0ae5caecc57748`. Its ZIP artifact SHA-256 is `941bae2ee81bd4a644d2ec688594dbe0623178e4052db924f4b1330309698e48`, artifact ID `13350578924`. A compact reproducible manifest and the six root receipts are separately committed to [`agent15-original6v9-rescue-native-negative-witnesses-20261104.json`](agent15-original6v9-rescue-native-negative-witnesses-20261104.json).

| Observation unit | Count |
| --- | ---: |
| Distinct paired physical source arrangements | 2 |
| Observed owner decision roots | 65 |
| Actually Store-accepted selected root actions | 65 |
| Registered recovery Item held-copy/root observations | 94 |
| Rescue Stretcher GRI held-copy/root observations | 24 |
| Rescue Stretcher with no known target and fully classified public discard | **6** |
| Rescue Stretcher with known public Pokémon target, other conditions unverified | 16 |
| Rescue Stretcher with public target identity unresolved | 2 |
| Native-enumerator offers of the six zero-target Stretcher observations | **6** |
| Stretcher actually selected by bot at these six roots | **0** |
| Competitive games qualified | **0** |

The six guaranteed negative witnesses all came from **original rank 9 in seat 0, physical slot B, seed 1192664073**, at owner-root ordinals **5, 6, 9, 10, 12, 13**. Their public discard contained only `Guzma BUS` at root 5, only `VS Seeker PHF` at root 6, and then `VS Seeker PHF` plus `Darkness Energy MEE` at the remaining four roots. All were visibly offered by native `ActionEnumerator`; none had a Pokémon in public discard. This is a **same-deal, correlated sequence of held physical card observations**. It is no evidence of six independent games, and no observed selected Stretcher play was shown.

After `Mega Absol ex M1L` appeared in the public discard, the conservative source-name-set classifier held two Stretcher roots at UNKNOWN, rather than incorrectly proving a negative; the parallel exact-native ID evidence records `MEG/86` as a Pokémon, but native catalogue identity alone does not certify the official physical printing or any paper play. Once `Unown AOR` also entered discard, the source classifier could safely state a target exists. It continued to leave overall paper eligibility UNKNOWN.

## Interpretation and limitations

This is an **actual reproducible native enumerator over-offer** relative to a paper necessary condition. Source text and public state suffice for the negative. A development policy could use the certificate to avoid proposing a dead Rescue Stretcher at those exact roots. We did not run a selected policy variant, dispatch that Item, complete the game, or measure the value of avoiding its offer. Even a positive public target does not prove the Item is playable, worthwhile or correctly settled. Standard root/action observations are correlated, and the native engine is not a complete oracle for paper Expanded legality.

This experiment supports an **eligible negative gate component** for future Issue #25 full-policy integration. It establishes no final fixed deck or 99.5% game win rate and leaves the 29/32 original field coverage unchanged.
