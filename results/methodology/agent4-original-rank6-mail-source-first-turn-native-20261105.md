# Agent 4: original rank-6 source skipped two held Trainers' Mail

**2026-11-05 | Aichi paper Expanded original source | native developmental evidence.** This concerns opponent-policy competence. No win-rate inference or complete paper-certified game follows.

## Frozen original physical opening

Original rank 6 is Kazuma Kashi's Iron Thorns ex, with three Trainers' Mail ROS in its authenticated 60. The exact native benchmark arm was **6:100:A:champion-reference**, source physical seat 1, candidate physical seat 0. Source had two Trainers' Mail in hand at its first-turn original Pass, native action ordinal 14.

- Full deal SHA256: 026961dcb9da821bca397e59293c4705662708f56e53e5be70f2967911aa7370
- Source deal SHA256: 700f0f6e1fa884906c79cf2275741f036d212428fae01c8f2c132dc9ada086b2
- Original accepted action prefix 0 through 13 SHA256: f8b2b534e43d4569ef0ad45bbc567e91d3a42a6bcedd7bb97217676ca7c25669
- Owner hand at Pass14 SHA256: 9b63794ff78d742410d9c081ef3022c05e0055afd29f8cbc3228d9a62943450c

Registration: results/aichi-2026/registrations/agent4-rank6-trainers-mail-pass14-20261105.json. The historical native v5 source archive comes from CI run 42059191496 artifact 13432225055. The independent source-owner Pass archive comes from run 42079458048 artifact 13440370610.

## Genuine one-Item Store counterfactual

The same original eight deals, source and candidate policies, and all action roots before Pass14 are preserved. One physically held original source Mail is played in place of Pass14.

[Native CI run 42090074620](https://github.com/FlareZ123/experiment-01/actions/runs/42090074620), [artifact 13444333337](https://github.com/FlareZ123/experiment-01/actions/runs/42090074620/artifacts/13444333337), inner JSON SHA256 62911d6d635d9fc63b1e5ca43ba565e325a4c530557af1d2803e824fa3473fc5.

| Physical native observation | Result |
| --- | --- |
| Original eight native attempts | 8 retained |
| Whole and source physical deals | Both verified exact |
| Original accepted roots 0 to 13 | Exact SHA256 match |
| Source hand with two Mail | Exact SHA256 match |
| Replacement source Mail root14 | Actual Store-accepted PlayCardAction |
| Next native step | ChooseCardsPrompt at root15 |
| Source hand transfer or settled search | None; bot decoder aborted |
| Subsequent attack or opponent reply | None |
| Competitively qualified games | **0** |

The pinned source of TrainersMail invokes the shared top-four Trainer search helper. The helper skips its ChooseCardsPrompt when no eligible non-Mail Trainer is present. The genuine pending source-owner prompt is therefore evidence, within the pinned engine model, of at least one selectable non-Mail Trainer in those four physical source-deck cards. The exact chosen identity and physical transfer remain unproven.

## Owner prompt diagnostic

The first outer-hook owner continuation ([run 42091746238](https://github.com/FlareZ123/experiment-01/actions/runs/42091746238), artifact 13445397488) observed one native Store and the accepted source Mail. The matching prompt existed, but the outer bot decoder interceptor received zero owner prompt callbacks. A decoder exception recurred at root15. This is a negative result, consistent with interception-order masking.

An amended continuation installs the source owner-only prompt hook inside the actual match, after existing common-policy decoders are registered. It is a separate research revision. Both revisions retain zero qualified games.

The full source-Pass archive contains nine correlated Pass observations across the two rank6 first-deal arms where two Mail remain held. These are repeated decisions from fixed seeded openings, not independent games.

## Limitations and next steps

Original-source play quality remains a benchmark blocker. Item acceptance and prompt creation do not demonstrate a resolved search, strong source choices, full-game opponent competence or a candidate win. Verify the owner-visible top-four native selection, physical Trainer transfer, following own action and real opponent reply. All future tests should preserve entire-deal and source-prefix identity, negative outcomes and native pin.

Research code: simulation/evaluation/agent4-rank6-original-mail-pass14-fork.cjs; simulation/twinleaf/agent4-mail-owner-prompt-choice.cjs; simulation/twinleaf/agent4-mail-owner-prompt-native.cjs; simulation/evaluation/agent4-rank6-mail-owner-prompt-v2.cjs. Tests and opt-in existing manual workflow are included; upstream Twinleaf is untouched.

Current original-source benchmark coverage remains 29 of 32 published prints, with ranks 23, 25 and 28 missing.
