# Agent 6: preregistered original-Store source-first Speed Lightning action, six exact source deals

**30 October 2026 | Development mechanics and native reply evidence only.** This measures whether an authentic original Aichi rank-6 Iron Thorns source can execute the existing opt-in owner-visible first-turn Speed Lightning Energy staging and draw before the candidate's next owner turn.

## Reproduction

- **Prerecorded registration:** [six physical source-seat/seed pairs](registrations/agent6-firstturn-speed-native-20261030.json), committed **before** native execution at `92a65c5c8c7cbdf7245cbd07c7449aa387d06ab4`. Source is exact published rank6 Iron Thorns original 60; candidate is unchanged rank1 champion-reference Shadow Rider original 60.
- Original rank-6 source is deliberately made first player using per-actor `GO_FIRST` preferences (source prefers first, candidate second); the actual coin winner still receives the native prompt. **This is a forced source-first mechanics study**, without a representative coin/start distribution.
- Paired arms run with source `stageSpeedLightningFirstTurn:false/true`, both with `liveSpeedLightningAlternative:true` and `playLockAwareOpening:true`. Real original Store, canonical actor composition and the [existing reversible source plan](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs), both physical source seats, strict prompt validation, max 110 actions. [Research runner](../../simulation/evaluation/agent6-rank6-firstturn-speed-native.cjs) adds a **read-only native Store dispatch observer** for physical Active Energy, source hand/deck before/after actual Speed play. The observer does not influence any player's decisions.
- [Manual CI 40985934772 completed SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40985934772) at research head `cc372934472cff7e64aa7cda6dd073ec9363fd36`, vendor `vendor/twinleaf` pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing manually dispatched setup-audit workflow was extended with an opt-in positive control and complete artifact archive; no new workflow, no push trigger.
- Complete [12-arm artifact 12946384373](https://github.com/FlareZ123/experiment-01/actions/runs/40985934772/artifacts/12946384373), ZIP SHA-256 **`1b7e58a765ba6f86fbbc2571c348850c1a478a1dc034caadc18c97fb1f3b5861`** independently confirmed against GitHub digest. Contains `agent6-rank6-firstturn-speed-native.json` 16,406 bytes.

## Exact matched native results

| Source seat | Fresh seed | Stage selected and natively attached Speed? | Baseline first source turn | First candidate turn-2 response? | Source T3 planner completion control → treatment |
| --- | ---: | --- | --- | --- | --- |
| A | **531384326** | **Yes, 2 real cards drawn** | Pass | Yes, both | No → **Yes** |
| A | 2341469307 | No | Pass | Yes, both | No → No |
| A | **3030747015** | **Yes, 2 real cards drawn** | Pass | Yes, both | No → No |
| B | 516187842 | No | Pass | Yes, both | Yes → Yes |
| B | 2411836147 | No | Pass | Yes, both | Yes → Yes |
| B | 492959857 | No | Pass | Yes, both | No → No |

**All 12/12 original-Store attempts had zero exceptions.** All six baseline/treatment pairs had **identical initial source physical-deal digests**, same toss winner and actual source-first native draw-log proof. In the two changing deals, baseline accepted only source Pass; treatment's first source-turn accepted root was an actual `PlayCardAction` named `Speed Lightning Energy`, followed by Pass. **Source Active physical Speed count increased 0→1** in each. The opponent subsequently played a real turn: the candidate's accepted turn-2 root labels were identical across baseline and treatment for each of these two pairs. On the other four pairs, the Speed stage was never selected.

Native original-Store Energy settlement receipts:

| Original source seed | Source hand before → after actual Speed play | Source deck before → after | Attached physical Speed |
| --- | --- | --- | --- |
| **531384326** | 6 → 7 | 46 → 44 | +1 |
| **3030747015** | 7 → 8 | 46 → 44 | +1 |

Both source hands gained **net one** because the actor played one Energy and the pinned Store genuinely drew **two**. The four nonactivating source deals do not establish a missed legal opportunity or strategic weakness: the owner-visible condition may not have been met. Across all 12 attempts, the recorded `gameFinished` flag was true in 3/6 controls and 4/6 treatments, with the remainder capped by this fixture's action limit. These incidental unqualified engine terminals are **not win-rate estimates**.

The seed `531384326` treatment changed `sourceTurn3LineCompleted` from false to true. This is the source wrapper's *attack-selection completion flag*, rather than a validated post-attack damage/Prize effect; the artifact did not independently certify full attack settlement.

## Evidence limit and next gate

This supplies a concrete original-60 **native source-owned action-coverage improvement** and confirms physical printed draw resolution with real candidate follow-through. The policy remains a deliberately constrained scripted line. Timing, tool or Supporter contention, alternative holds, later draw differences and source lock/control goals still need authentic owner-state arbitration. Start order was intentionally source-first and small, so the observations cannot rank the two fixed candidate decks or represent the Aichi Top32. Preserve all 12 attempts, including caps, for any retrospective comparisons; only a separately frozen prospective field protocol can support performance claims.

**Research target remains 29/32 authenticated opponent 60s, zero qualified competitive games and no demonstrated fixed 60 with 99.5% field performance.**

## Postgame additive native attack-settlement audit, 30 October 2026

The original report above was written from the first successful native source/draw cohort. A subsequent **read-only additional observer** reused the exact same six already preregistered source-deal seeds and 12 treatment/control arms. Its result is **retrospective settlement validation**, without pretending the reused seeds are a new independent cohort.

- Code [`simulation/evaluation/agent6-rank6-firstturn-speed-native.cjs`](../../simulation/evaluation/agent6-rank6-firstturn-speed-native.cjs) was extended (commit `3bd24191db30b191d0eb63a2eb0c8800ee780ad8`) to enable `capturePublicAttackTransitions` and call the **already independently developed** `candidateAttackSettlement(game, sourceSeat)` from Agent37. This reads accepted original Store attack declarations, prompt closure, before/after public board, Prize changes and first opposing owner-turn root. No changes to the original source policy, candidate policy, seeds, decklists or runtime decisions.
- [Compiled manual CI **40986385015** completed SUCCESS](https://github.com/FlareZ123/experiment-01/actions/runs/40986385015), research head `399fce12822c99f9be5bb8bad4e0aebae96d4ee3`, Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. [Complete artifact **12947496391**](https://github.com/FlareZ123/experiment-01/actions/runs/40986385015/artifacts/12947496391) ZIP 2913 bytes, SHA-256 **`009ebe8f8bab92212707f7f6439776ab9b4f7195d27db385f510e16d5543f0bd`**, independently verified against published GitHub digest. The JSON inside has schema `agent6-source-first-speed-six-deal-native-v2`.
- The original 12/12 native-execution success, 6/6 same-opening-deal match, 2/6 first-turn Speed physical draw receipts and first candidate turn-2 roots remained unchanged. No new failed arms.

### Consequential settled source attack

**Exactly one of the two newly staged Speed treatments produced a new second-source-turn attack**, source A against rank1 reference, preregistered seed **531384326**. The source Turn-3 policy completion marker now has a matching **native Store public effect**:

| Native evidence | Genuine observed result |
| --- | --- |
| Source original `AttackAction` | **Volt Cyclone**, global turn 3, accepted root ordinal **28** |
| Prompt-closed settlement | **True**, completion root ordinal **34** |
| Source physical Active before | Iron Thorns ex, 10 damage, **Speed Lightning Energy + Double Colorless Energy** attached |
| Opposing Active before | Marshadow, 0 damage, Psychic Energy attached; three other Bench Pokémon |
| Source Prize count | **6 → 5**; one-Prize Marshadow Knock Out |
| Opposing Active after | Lillie's Clefairy ex promoted; Marshadow absent from public board |
| Source physical Active after | Iron Thorns ex, 10 damage, **Double Colorless Energy** attached |
| Source Bench after | Second Iron Thorns ex now has the transferred **Speed Lightning Energy** |
| Immediate next candidate root | Original Store turn **4**, root ordinal **35**, accepted **PlayCardAction: Psychic Energy** |
| Same-epoch proof | **True**; no reset crossed between declaration, prompt closure and candidate return |

The matching baseline with the same starting physical source deal had **zero** source attack declarations during this fixture's recorded horizon; the treatment had exactly **one accepted and settled Volt Cyclone**. The other four unmodified/no-staging deals did not acquire a new source attack; two identical source-seat-B pairs already had one accepted settled `Volt Cyclone` each in control and treatment, independent of the Speed stage. The other staged deal `3030747015` genuinely attached/drew on turn 1, but neither baseline nor treatment declared a turn-3 attack, correctly retained as a negative follow-through case.

This is now a **complete native physical source Energy attachment + two-card draw → Turn-3 printed attack → Prize Knock Out → source Energy movement → immediate opponent root** witness under the original Store. It does **not** certify paper human decision quality, a general probability of executing this line, coherent opposing control policy, result under a competitive paper clock, or the full Aichi field. The source-first preference was deliberately fixed for a mechanics control, and selecting Speed on its first turn still has alternatives with untested opportunity cost.

**Game qualification remains zero.**
