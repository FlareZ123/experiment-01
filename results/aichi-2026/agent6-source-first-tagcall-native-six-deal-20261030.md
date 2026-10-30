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
