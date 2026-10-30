# Agent 6: first-turn Tag Call original-source Item bank and same-turn-three effect, six retrospective native deals

**30 October 2026 | Development-only owner-K0 Item → genuine owner-deck K1 search test.** This is a follow-up to the [first-turn owner-hand census](agent6-rank6-source-first-k0-item-contender-20261030.md). The six physical source-start seeds were *retrospectively reused after viewing their K0 owner hands*, explicitly marked in [the fixed treatment manifest](registrations/agent6-retrospective-tagcall-six-deal-20261030.json) committed **before the Tag Call experiment** at `af6874a0109cfb62f53f5df7fc8ce82a636ab7ae`. No out-of-sample probabilities, field claims, or claims of fair candidate superiority follow.

## Reproduction

- Original exact Aichi rank-6 Iron Thorns LO source 60, original rank1 champion-reference Shadow Rider 60, unchanged; both source physical seats. Each source-first owner-hand/seed is replayed as T1 Tag Call script absent vs present. A fixed source-favors-first/candidate-favors-second GO_FIRST policy forces source-first regardless of who wins the native coin. Rank6's existing T3 scripted attack, canonical actor-only policy and non-stage-Speed T1 behavior are the same across both arms.
- New default-off reversible [`agent6-source-first-tagcall.cjs`](../../simulation/twinleaf/agent6-source-first-tagcall.cjs) (commit `514ebf3`) only proposes Tag Call from the authentic source's own hand during its global first turn, while Item play is not prohibited and Iron Thorns ex is Active. **No private deck card is examined at K0.** Only after the native original Store issues a real owner-deck `ChooseCardsPrompt`, the source queries that searchable deck for `Guzma & Hala`, validates the target against the genuine prompt, selects one actual printing, and allows the native Store to move it to hand. Its audit logs both original Store Tag Call root acceptance and original prompt acceptance. Other actions delegate to the existing source/canonical policy.
- [Complete 12-arm runner](../../simulation/evaluation/agent6-source-first-tagcall-native.cjs), commit `7429a06`, includes genuine source turn1 root stream, immediate candidate first own turn2, settled source T3 attack declarations and public Prize/damage/owner response via the separately verified Agent37 observer, and source-deal SHA. All failures are archived rather than selected away.
- Existing manually triggered setup-audit workflow acquired one additional **default-OFF** `agent6_tagcall` Boolean option and artifact step (commit `b59f5f8`), with no new workflow or push trigger.
- **[Manual CI 40987522446 completed SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40987522446)** at research head `b59f5f8e1a0bb6796063f4cd6c2122c71f27db6e`, vendor Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Complete original Store artifact 12947672507](https://github.com/FlareZ123/experiment-01/actions/runs/40987522446/artifacts/12947672507), 3033-byte ZIP, published and independently verified SHA-256 **`7e2a0f6d58731de4535fa7d99772f87a52b2c5e88982fa59e160118659f4b13b`**, JSON `agent6-source-first-tagcall-retrospective-native-v1` (43,698 bytes).

## All retained original source deals

| Source seat / seed | Held T1 Tag Call? | Treatment Tag Call accepted and owner deck prompt resolved? | Source T3 genuine settled `Volt Cyclone` count, baseline → treatment | First candidate turn2 roots seen |
| --- | --- | --- | --- | --- |
| A / 531384326 | No | No, no eligible own-hand Item | 0 → 0 | Yes |
| **A / 2341469307** | **Yes** | **Yes; G&H CEC obtained** | **0 → 0** | Yes |
| A / 3030747015 | No | No, no eligible own-hand Item | 0 → 0 | Yes |
| **B / 516187842** | **Yes** | **Yes; G&H CEC obtained** | **1 → 1** | Yes |
| **B / 2411836147** | **Yes** | **Yes; G&H CEC obtained** | **1 → 1** | Yes |
| B / 492959857 | No | No, no eligible own-hand Item | 0 → 0 | Yes |

All **12/12 native attempts had zero Store exceptions**, and all **6/6** baseline/treatment pairs had exactly matching original-source physical starting-deal digests and true source-first native draw logs. Exactly **3/3** held-Tag-Call interventions produced a genuine first-turn `PlayCardAction: Tag Call`, original Store owner-deck `ChooseCardsPrompt`, accepted `ResolvePromptAction`, and actual single-printing **Guzma & Hala CEC** selected. The unchanged baseline first source T1 root was Pass on all six. Treatment T1 Tag Call then Pass is proven in each of its three successes.

The native original Store's turn-three public attack observer reports two non-Tag deals with **one already-settled** source `Volt Cyclone` each in both arms. In each case, the printed attack took one Prize. The other newly fetched G&H source deal **2341469307** still achieved **zero** source T3 attack declarations in either arm, even after successfully searching for Guzma & Hala in the treatment. The available T3 source and candidate policy is therefore a stricter bottleneck than this particular search connector in the observed treatment.

## Interpretation

Tag Call is a **demonstrated native legal first-turn owner action** in three real original Aichi-rank6 source hands, with genuine K1 target validation and the original Store's hidden-zone protection. It offers an additional actor-owned Item option beyond the Pass-only baseline, but selecting it does not itself prove that playing it now is beneficial. The negative first-turn-to-turn-three conversion in seed 2341469307 is important: the source could access a tactical Supporter, yet its attack line still failed to be declared under the same capped development policy. Analysis must trace *why*: Prize/Target availability, Energy attachment contention, Supporter quota, Stadium requirements, opponent action, and first-owner resource choices before declaring a policy defect.

**Qualifying competitive games remain zero.** This source-first comparator is deliberately a mechanic stress test on a retrospectively reused 6-seed cohort, with incomplete opponent competence, no paper clock and 3 missing original Aichi 60s.

## Reproduced v2 source-T3 failure and v3 K1 Prize inference, 30 October

The original `3/3` accepted Tag Call results were reproduced on exactly the same **six retrospectively reused physical deals** with two strictly read-only additions. This is continued diagnosis of an already selected development sample, not a fresh independent experiment.

1. [Manual original Store CI 40987786142](https://github.com/FlareZ123/experiment-01/actions/runs/40987786142) completed SUCCESS at code head `02dc943e79ecd213610af1f2260a115f5f0ec032`; ZIP artifact **12948275127**, SHA-256 `43b672a6a4bcbfc9b35ad34c7429cb9256850223440d34b3e64f89aa1f62ab48`, was downloaded and verified. The patched [evaluation runner](../../simulation/evaluation/agent6-source-first-tagcall-native.cjs) now also archives source turn-three original root actions, its first owner-hand observation, K0/K1 wrapper plans and exact abort reasons. **All 12 original Store runs still had zero exceptions.**
2. [Manual original Store CI 40988257742](https://github.com/FlareZ123/experiment-01/actions/runs/40988257742) completed SUCCESS at research head `2f476358f75d52b91b7276ccb9fade22b8727edf`, pinned Twinleaf unchanged at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; ZIP artifact **12947718546**, independently checked SHA-256 `77dcbb8269ab2b0d40b5d8656b549bcfb863a30258d77950ad44c56cb950ffe8`. The reversible [source Tag Call adapter](../../simulation/twinleaf/agent6-source-first-tagcall.cjs) was extended with a **native K1 owner-deck-only singleton localization observer** (commit `00d1cf3aaa156bf30fa16fa1950862689522f162`). It reads the source's own deck contents **only after authenticating a real `ChooseCardsPrompt`** from its own Tag Call, then counts the single original Thunder Mountain Prism Star in its own deck, hand, discard, Lost Zone and Stadium. It never reads any Prize identity, and the observation is not passed to a decision policy.

### Exact source turn-three cause, original seed 2341469307

| Original Store evidence | First-turn Tag Call **absent** | First-turn Tag Call **enabled** |
| --- | --- | --- |
| T1 accepted source roots | Pass | Tag Call, then Pass |
| K1 searched card | None until T3 | Genuine owner-deck **Guzma & Hala** |
| T3 own-hand search connector | Held Tag Call + Double Colorless Energy | Held Guzma & Hala + Double Colorless Energy |
| T3 source selected root | Play Tag Call, resolve G&H | Play held G&H, resolve optional mode |
| T3 source planned resources | Stadium required; DCE already held | Stadium required; DCE already held |
| Native source plan abort | `K1 invalidated opening line: Thunder Mountain Prism Star` | `G&H prompted search could not retrieve planned targets` |
| T3 original Store declared attacks | 0 | 0 |

**Crucial verified singleton location:** the exact published source rank-6 60 contains **one** `Thunder Mountain ♢ LOT 191`, internally the original Store `Thunder Mountain Prism Star`. On its *first turn*, the owner's authenticated Tag Call search revealed `ownDeck:0, ownHand:0, ownDiscard:0, ownLostZone:0, ownStadium:0`. The source was the very first player and the original setup had not moved or attached that Stadium. With the only original physical copy absent from every ordinary non-Prize owner zone, this is **K1 process-of-elimination evidence that the singleton was Prized**. The observer records `inferredPrized:true` and `directlyInspectedPrizes:false`. It does not peek at any face-down Prize card.

The other two source Tag Call first-turn successes have `ownDeck:1` for the same Thunder Mountain at their genuine first-turn owner-deck searches (seeds **516187842** and **2411836147**), and their already certified T3 original Store Volt Cyclone attacks remain **1→1** under the paired control and treatment. Therefore the one case where extra G&H access failed is explained by **an inaccessible one-of Stadium**, with a direct K1 physical localization rather than only a heuristically guessed missing Item or a broad statement that the bot was bad.

**Important qualification:** this is the source's limited **Thunder Mountain-dependent programmed opener**. Another valid legal attack route could exist in a future turn using differently attached Energy, alternate cards or recovery, and the full paper-expanded matchup is not solved by identifying the Prized Stadium. First-turn Tag Call may still have other strategic uses. The forced source-first, retrospectively reused 6-deal protocol remains fully **unqualified for competitive win-rate inference**.

The net learning is a concrete example of **access without completion**: first-turn Item creates Supporter access, yet a distinct one-of Stadium channel is inaccessible due to Prize composition. Other agents should treat multiple resource requirements jointly when assessing search connectors, and keep K0 unknown Prize state distinct from legally searched K1 deck information.
