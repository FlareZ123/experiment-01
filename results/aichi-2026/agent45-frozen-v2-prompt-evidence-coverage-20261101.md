# Agent 45: frozen native prompt evidence coverage, 1 November 2026

**Retrospective original-Store audit of two complete frozen 32-arm development archives. Competitive-qualified games: 0.**

## Reproducible custody and question

The [Critic prompt legality release veto](../../communications/broadcast/20261101T0550Z_critic_prompt_dispatch_legality_frozen_profile_veto.md) distinguishes native Store acceptance from paper legality. We audited actual prompt observer coverage in the already completed original-source benchmark instead of assuming all native prompt resolutions were checked.

| Archived native profile | GitHub Action and artifact | ZIP SHA-256 | Attempts |
| --- | --- | --- | ---: |
| v1 baseline | [Run 41278620085](https://github.com/FlareZ123/experiment-01/actions/runs/41278620085), artifact 13072746019 | f390c288ffddf8bfeeba7ab18cbb8aabbd1d913048fe55e82c1b09cb60a3b587 | 32 |
| v2 public-context Energy | [Run 41279242584](https://github.com/FlareZ123/experiment-01/actions/runs/41279242584), artifact 13072623187 | cb23422028015e88d8d701d5d6ffe46de137bdcf22abfe4e5e80abe20a33bd4b | 32 |

Each ZIP contains its corresponding agent41-frozen-bilateral-development-v1-native.json or v2-native.json. All arms are original rank 6 Iron Thorns or rank 11 Absol/Garbodor against the champion reference or New Moon Lockbreaker. The v2 one-factor change was chosen after seeing v1, making this a paired developmental comparison.

Reproduction: use [pure audit module](../../simulation/evaluation/agent45-frozen-prompt-coverage.cjs), export auditFrozenPromptCoverage, with each extracted archived JSON object. Its [eight Node 22 tests](../../tests/agent45-frozen-prompt-coverage.test.cjs) passed locally. The local test file and code module both have byte-identical Git blob SHA-1s with the current main-branch files. The module rejects missing observer channels or duplicate attempt IDs, uses postgame evidence only, and retains an unconditional PROMPT_PAPER_UNVERIFIED disposition.

## Actual native archived observer counts

The archived rootActionLedger supplies an independent **headless action-family denominator**. Its length equals the declared rootActionCount for all 32 attempts in both versions. The full logged ResolvePromptAction families are enumerated below, though this does not automatically represent hidden/internal Store dispatches or prove any prompt reply accepted.

| Logged headless family | v1 | v2 |
| --- | ---: | ---: |
| All root actions | 7,006 | 6,314 |
| ResolvePromptAction roots | **4,811** | **4,331** |
| WaitPrompt roots | 4,019 | 3,431 |
| Other ResolvePromptAction roots | **792** | **900** |
| ShuffleDeckPrompt | 208 | 241 |
| ShowCardsPrompt | 78 | 87 |
| ChoosePokemonPrompt | 45 | 69 |
| ChoosePrizePrompt | 27 | 54 |
| SelectPrompt | 37 | 21 |
| OrderCardsPrompt | 18 | 2 |
| ConfirmPrompt | 49 | 48 |
| ShowMulliganPrompt | 44 | 44 |
| CoinFlipPrompt | 32 | 32 |
| ChooseCardsPrompt | 250 | 271 |
| SelectOptionPrompt | 4 | 4 |
| AttachEnergyPrompt | 0 | 27 |

**Exact family-count reconciliation:** all 250/271 ChooseCards and 4/4 SelectOption headless roots match the pre-dispatch choice observer cardinalities; all 0/27 AttachEnergy roots match the accepted-energy sidecar cardinalities. Thus, for these named families the distinct audit channels have no missing/extra records by count within the logged root stream. The follow-up exact ordinal, turn, owner and prompt-kind join matched **all 254/254 v1** and **275/275 v2** choice events to their corresponding logged headless roots. The AttachEnergy sidecar has a separate Store dispatch ordinal, but every one of its **27** original source event turn/owner pairs matched a *unique* headless AttachEnergyPrompt root within its native game. Thus, the observer-root mapping is stronger than simple cardinality for these channels, although it still does not establish general printed legality.

| Observer channel / status | v1 | v2 |
| --- | ---: | ---: |
| Complete attempted native rows | 32 | 32 |
| Pre-dispatch ChooseCardsPrompt records | 250 | 271 |
| Selected-card count within recorded numeric min/max | 226 | 247 |
| Null ChooseCards selection with allowCancel true | 24 | 24 |
| Recorded count or cancellation violations | 0 | 0 |
| Pre-dispatch SelectOptionPrompt records | 4 | 4 |
| ChooseCards choices with unclassified source zone | 60 | 49 |
| **Store-accepted AttachEnergyPrompt public delta receipts** | **0** | **27** |
| Accepted AttachEnergyPrompt owned by original rank-6 source | n/a | **27/27** |
| Public shape of one same-name Energy moved source Active to own Bench | n/a | **27/27** |
| Full native prompt-resolution population enumerated | No | No |
| Full independent paper legality certified | No | No |

All four SelectOptionPrompt records in each profile are rank-6 original source Guzma & Hala mode 1. All 24 null ChooseCards records in each profile were cancel-permitted according to their recorded native fields; this does **not** validate the surrounding card use. Native choice fields are captured before dispatch, so they are not proof of settlement or Store acceptance. The 49 v2 unclassified zones further restrict choice validation. No errors in those limited recorded numeric checks establish paper legality.

## A precise positive control: original rank-6 Volt Cyclone

The provided English card database identifies Iron Thorns ex TWM (SV6-77), printed Volt Cyclone for 140 damage with an instruction to move one Energy from itself to a Benched Pokémon. The 27 Store-accepted AttachEnergyPrompt public-board receipts from v2 all show:

- the actual original rank-6 source seat as actor;
- unchanged Active Iron Thorns ex TWM losing exactly one named Energy;
- one unchanged source Benched Pokémon gaining exactly that Energy name;
- no other source-position Energy or attached Tool changes in the source delta.

The observed moved cards are from Double Colorless, Speed Lightning, Capture, and Spiky Energy. Some prompt dispatches also alter an opposing Pokémon's public board position; the checker deliberately ignores those opponent-side attack effects. **All 27/27 uniquely joined source AttachEnergyPrompt roots identify a genuine source-owned native AttackAction named Volt Cyclone via initiatingRootActionOrdinal**, and each is independently present in the recorded sourceAttackSettlement attacks with a same-epoch settled prompt chain and completionRootOrdinal after that prompt. This authenticates the original AttackAction-to-prompt-to-public-effect chronology for the bounded observed movement. The seven tests cover wrong owner, extra Energy, wrong Active printing, missing board evidence, bad geometry, an opponent simultaneous KO, and a negative attack-settlement join.

**All 50/50 source Volt Cyclone attacks now have a complete bounded conditional effect disposition** from the original Store public board snapshots. Every one had a settled same-epoch attack in sourceAttackSettlement:

| V2 original rank-6 source attacks | Occurrences | Native effect witness |
| --- | ---: | --- |
| Source had at least one Benched Pokémon before the attack | **27** | Exactly one rooted, accepted, settled AttachEnergyPrompt and matching one-Energy Active-to-own-Bench public change (**27/27**) |
| Source had no Benched Pokémon before the attack | **23** | No AttachEnergyPrompt for that attack (**23/23**); the Energy-movement portion has no possible recipient |
| Missing public Bench snapshot, unexpected prompt, missing settlement or invalid public movement | **0** | Fail-closed unresolved classification, not observed |

The v1 frozen baseline contained just **one** settled source Volt Cyclone, with zero source Benched Pokémon and no Energy movement prompt. The [advanced player manual's general partial-effect rule](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md) states that an attack can resolve the applicable parts even when some other instructions cannot be applied (Section II.A). This explains why a source attack without a Bench should still perform damage without generating an Energy-recipient prompt. The classifier's negative test adds an unexpected prompt in precisely that zero-Bench state, producing an unclassified result. No inference is made about strategic player intent behind maintaining a zero-Bench board.

**Evidence limit:** This is source Volt Cyclone AttackAction attribution plus settled native prompt-chain and public movement-shape consistency. It remains short of a complete independent check of the private submitted prompt payload, paper-legal ability/attack preconditions, all 50 other source declarations, or full Store dispatch legality/coverage. Equivalent-name physical Energy cards cannot be individually distinguished by this observer. It is still PROMPT_PAPER_UNVERIFIED at the game level and cannot promote v2 engine winners to competitive wins.

## Concrete shared-release next action

The existing [choice evidence observer](../../simulation/twinleaf/native-prompt-choice-evidence.cjs) is pre-dispatch and [Energy public delta observer](../../simulation/twinleaf/accepted-energy-prompt-public-witness.cjs) only records AttachEnergyPrompt. Therefore the **logged headless ResolvePromptAction population is known (4,811 v1; 4,331 v2)**, but the total genuinely Store-accepted and independently paper-qualified prompt population remains **unknown**. The canonical two-seat runner already exposes logged headless root prompt family counts, but needs a **same-root join to Store-accepted results and independent paper verdicts** for every consequential family, with exact root/turn, actor, acceptance, independent printed paper predicate and limited status. The v2 recorded 900 non-Wait prompt roots, of which 302 are covered by existing ChooseCards, SelectOption, or AttachEnergy sidecars; **598 non-Wait roots belong to other families lacking these three narrow sidecars**. Some are passive ceremony/visibility mechanics, while ChoosePokemon (69), ChoosePrize (54), and SelectPrompt (21) require separate policy/target scrutiny. Neither the 598 count nor all recorded roots is an independent card-text legality audit. Retain PROMPT_PAPER_UNVERIFIED until tested; distinguish PROMPT_PAPER_INVALID when an independently forbidden reply is accepted. Do not give these owner-private observations to the decision scorer.

The 27 genuine source movement receipts supply a positive public-effect check. [Agent46's validated native Gengar forbidden-target finding](../../communications/agent41/20261101T0546Z_agent46_native_prompt_validate_bypass.md) supplies a negative control for the new paper prompt veto. Version the shared manifest rather than silently mutating frozen v2; retain every cap, abort, and error. No additional CI workflow is needed.

**Status unchanged:** 32/32 opponent archetypes identified, 29/32 authenticated original 60s, 0 competitively qualified games, no verified fixed 60, no demonstrated 99.5% Aichi Top32 win rate.
