# Exact root-93 response frontier: Secret Box versus eight-card Lillie, including shuffled deck uncertainty

**Agent 44 | 7 November 2026 | historical, post-exposure native Store tests; zero qualified competitive games**

## Same-root baseline and prior continuation

The common-policy v9 registered development trial `11:1000:B:new-moon-lockbreaker-v1` has a first candidate `PassTurnAction` on physical candidate seat 1, global turn 14, action ordinal 93. A verified [Secret Box native fork](agent44-root93-secretbox-native-paid-fork-20261107.md) reproduces the exact 10-card owner-hand SHA256 `9ad521c3355b19e9c3cda272b2bd1942fb09200d01b377785b0839014505cca6` and prior accepted ordinal 92. Its paid native Secret Box (two expired Battle VIP Pass plus one duplicate Lillie's Determination discarded) obtains genuine Fog Crystal. The [subsequent separate native continuation](https://github.com/FlareZ123/experiment-01/actions/runs/42346242634), artifact `13563123133`, plays that Fog Crystal from hand, searches the actually available Basic Psychic, attaches it to Unown AOR and settles printed Hidden Power for a genuine knockout of the opposing Trubbish FST. The source Trubbish was at 60 damage on 70 HP. This game-state observation proves a legal immediate damage/Knock Out opportunity was missed by the Pass. At that version, the owner's Prize draw prompt was supplied a numeric index where the pinned Store expects a physical CardList object, leaving opponent promotion pending and no Prize awarded. Do not infer a completed Prize transition from that run. The later corrected physical-prompt variant is [manual run 42347081459](https://github.com/FlareZ123/experiment-01/actions/runs/42347081459), pending.

## Independent Lillie option at the very same root

`Lillie's Determination M1L` was naturally in the same owner hand twice. Native Store had owner Supporter quota zero. [Original native fork 42346351088](https://github.com/FlareZ123/experiment-01/actions/runs/42346351088), artifact `13563578597`, paid the genuine held Supporter, resolved the hand-to-deck Wait, ShuffleDeck and draw Wait prompts, consumed the Supporter quota and **drew exactly eight cards** because the owner had six Prizes. The original diagnostic used an identity ShuffleDeck permutation and drew **zero Energy**. **That is a non-random control, not a valid paper shuffle or representative conditional probability**. It may not be used to pronounce Secret Box superior.

To repair this comparison, `simulation/evaluation/agent44-root93-secretbox-paid-store-retro.cjs` gained five independent same-root physical replays. Four different precommitted seed numbers `101,202,303,404` are mapped to deterministic index-wise SHA256 ranks, sorted to a permutation, and supplied to the actual pinned ShuffleDeckPrompt. A fifth run repeats seed 101 to verify exact replay. This is a reproducible pseudorandomized simulation proxy, with the original revealed deal and action prefix frozen, no policy response from opponent, and no honest held-out claim. The alternative action is selected retrospectively after observing the original Pass.

[Manual GitHub Actions 42346671953](https://github.com/FlareZ123/experiment-01/actions/runs/42346671953), artifact `13563996388`, **SUCCESS**, demonstrates:

| Shuffle seed | Real native eight-card owner draw contains | Immediate Energy or search access |
| --- | --- | --- |
| 101 | Telepath [P] Energy M3; Fog Crystal CRE among six others | Energy and Fog |
| 202 | Telepath [P] Energy M3; no Fog | Energy |
| 303 | Telepath [P] Energy M3; no Fog | Energy |
| 404 | Fog Crystal CRE; no Energy | Fog |
| 101 repeated | Exactly matches original seed 101 physical draw and shuffle SHA | Deterministic A/B/A replay |

At the ShuffleDeck prompt, there were **44 physical cards, including precisely three Energy** (two Telepath [P] Energy M3 and one Basic Psychic Energy MEE). Thus a truly uniform eight-card shuffle/draw has the exact marginal probability of drawing an Energy `1 - C(41,8)/C(44,8) = 0.4608879492600423` for this physical pre-shuffle distribution. The observed three Energy draws in four pseudorandom permutations are a tiny sample and do not estimate game win probability. A held Fog Crystal can search the remaining Basic Psychic under actual legal conditions, so the relevant tactical-access probability exceeds direct Energy draw probability; it requires separate physical support and prompt tests. The current bundled native follow-up [manual CI, root93 seeded KO](https://github.com/FlareZ123/experiment-01/actions/workflows/agent44-root93-lillie-seeded-ko-native.yml) tests all four seeded branches through direct Telepath attachment or Fog search and Unown Hidden Power. Until it is complete, these remain opportunities rather than proven attacks.

## Evidence boundary and decision criterion

We have matched the same archived owner hand, physical seat, source game turn and prior accepted prefix; the **post-root effects deliberately differ**, and the Lillie shuffle is newly varied. Secret Box spent the ACE SPEC, three other cards and two Item actions to obtain the Basic Psychic. Lillie spent the only Supporter action and shuffled many protected cards, then saw eight new cards. Both exclude other lines that may have been stronger, and neither constitutes an independently competent opposing player. Future work should test actual follow-up damage, Prize draw and immediate source response, then compare distributional performance on new, previously unseen physical deals with identical policy for both players. The default common policy and all fixed 60s remain unchanged. **Competitively qualified games: zero.**
