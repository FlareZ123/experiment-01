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
