# Agent 9: original-rank-5/11 owner Mail A/B/A native evidence, 3 November 2026

## Scope and provenance

Historical developmental native experiment, **not** a prospective competitive campaign. The exact authenticated Aichi 2026 rank-5 Mew/Genesect and rank-11 Garbodor/Absol printed 60s are unchanged. Source: `simulation/twinleaf/agent9-owner-mail-paired-original-source.cjs` at compiled manual GitHub Actions [run 41658633698](https://github.com/FlareZ123/experiment-01/actions/runs/41658633698), status **SUCCESS**, head `5a676e43607650f21883e9ca53280e5044ba70cb`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Native artifact `agent9-owner-mail-original-source-v1`: [artifact 13240534314](https://github.com/FlareZ123/experiment-01/actions/runs/41658633698/artifacts/13240534314), ZIP SHA-256 `232b245989660ac107ceda91a4074819ff9e96913f2c076dbb6fd68915f30db0`, decompressed JSON SHA-256 `c1da10aec0dd221f7387eb129453ca9ebc88f9834907f1be89cf56b16216bde0`. Artifact data were inspected directly, including all 12 stored attempts and their Store root ledgers. The reusable historical registration comes from `simulation/twinleaf/agent50-generic-owner-native-trainer-paired-v1.cjs`.

The only intervention is the reversible opt-in `simulation/twinleaf/agent9-native-owner-mail-after-pass.cjs` bridge. After an incumbent Pass it uses an owner-observation/card-count bound to select a physically held Trainers' Mail ROS, then resolves any actual Store-created Mail top-four prompt from the *revealed* temporary card list. It deliberately does not pre-read the concealed deck order. The upstream incumbent and other delegated prompts are **not** independently certified as owner-information-safe.

## All registered outcomes

| Original physical opening | Rank-5 seat | Seed | Control / Mail / control | Mail accepted |
| --- | ---: | ---: | --- | ---: |
| Repeat 1, slot A | 0 | 3133142136 | cap / cap / cap | 0 |
| Repeat 1, slot B | 1 | 465442104 | cap / cap / cap | 1 |
| Repeat 2, slot A | 0 | 2934853417 | native terminal / native terminal / native terminal | 0 |
| Repeat 2, slot B | 1 | 2316286015 | cap / cap / cap | 0 |

All four three-arm groups had identical captured initial full physical-deal hashes within group, including both source 60s in their original seat assignment. The two no-intervention controls were byte-equivalent after the archive's `gameEvidence` projection in **4/4 groups**. **12 attempted**, **0 errors**, **1 selected and Store-accepted Mail root**, **0 Mail Store rejections**, **1 live owner top-four ChooseCardsPrompt accepted**, **1 chosen card physically settled in hand**. The native terminal in repeat 2 slot A was identical with the intervention enabled or disabled and therefore is no Mail benefit observation. Other nine attempts were action-capped. No attack or Prize-taking payoff was observed in the one Mail-affected opening through its recorded 90 root actions.

## The one actual changed root

Repeat 1 slot B, rank-5 owner in seat 1, seed 465442104. At game turn 16, owner physically held Trainers' Mail ROS at hand index 13. The owner deck held 38 cards; the source-count lower bound calculated **17 eligible other Trainers** in that deck. The unmodified common policy chose Pass. The intervention's root `PlayCardAction` was Store-accepted. An actual native `ChooseCardsPrompt` followed at action ordinal 61, and the bridge selected the revealed `Float Stone BKT`. It reached the physical owner hand as recorded by the bridge, followed by the owner's Pass and the opposing seat's next-turn Pass.

At turn 18, the unmodified control played Crobat V then Passed. The intervention arm instead Passed while its hand held the newly found Float Stone and a Double Colorless Energy. This is a concrete **decision-path displacement**, with no settled source attack in that 90-root horizon. It is not a demonstrated strategic regression: the treatment consumes additional root/prompt actions and may change later draws, and the recorded horizon is limited. The second control reproduced the first control's original Crobat branch.

## Evidence classification and integration consequence

- **Native Store evidence:** exact original 60s, selected Mail root, native acceptance, native revealed-card prompt, chosen card into hand, opponent next Pass, A/B/A initial physical parity and control repetition.
- **Card/owner information evidence:** the bridge's own Mail proposal reads owner observation and aggregate source printing counts; its top-four choice occurs only after that specific prompt is exposed. The incumbent `SimpleTacticsAi` choice is an upstream input to the after-Pass decision, so this experiment does **not** establish whole-policy information-set safety.
- **Uncertified:** independent printed Mail discard-zone custody, the correctness of all upstream/delegated bot decisions, strategic superiority to the control's Crobat action or other held options, meaningful adversarial response, clock adjudication, full legal game status or any win-rate inference.

**Recommendation for the existing common-policy integration:** preserve this precise turn-16 source decision and turn-18 control divergence as a regression/counterfactual fixture. The next selected symmetric policy should compare the real Mail opportunity against all paper-affordable alternative intents, verify exact payment and physical transitions, and require a settled attack/control outcome with an opposing reply. This is one input to the single registered policy release requested by the 18:09 Critic. No additional default flag, CI workflow, candidate deck or `results/README.md` promotion is warranted on this evidence.

**Project decision status:** 29 of 32 exact original opponents authenticated, ranks 23/25/28 missing; no selected fixed 60; zero competitively qualified games; no verified 99.5% field win rate.
