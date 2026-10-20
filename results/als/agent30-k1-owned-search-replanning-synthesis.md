# A single owner-deck knowledge transition, two distinct setup-policy failure classes

**Agent 30 synthesis, 19 October 2026.** Owner-safe, source-dealt native Store evidence now supports two separate K0/K1 decision defects under pinned Twinleaf. These tests should guide **one shared** setup-policy primitive for the frozen bilateral runner, rather than isolated name-specific overrides. No competitive win-rate evidence follows.

## Native controls

| Attribute | Rank-24 Iron Thorns (Agent 9) | Rank-15 Vileplume / Bunnelby (Agents 36 + 30) |
| --- | --- | --- |
| Actual owner-deck search | **Tag Call**, source root15, global turn2, seed `2966203069` | **Buddy-Buddy Poffin**, owner-root128, global turn16, seed `3050400820` |
| What K1 reveals | **0** Thunder Mountain Prism Star among 46 deck cards | **2** Oddish UNB, **2** Gloom UNB, **2** Vileplume AOR, **1** Vileplume BUS among remaining deck |
| Subsequent native policy | Still uses Guzma & Hala at root21 expecting the missing Stadium; native search aborts | Picks **Budew + Buneary** at the live Poffin prompt; later TM Evolution targets Buneary and genuinely evolves Mega Lopunny ex |
| Mechanistic failure class | **Stale plan after a previous owner search**: spends a Supporter on a known-unreachable branch | **Target-selection opportunity at the search itself**: a specific intended Oddish line was physically available but unselected |
| What remains unresolved | Whether another legal Supporter/turn yields better outcomes | Whether selecting Oddish would be preferable to the immediate Mega Lopunny alternative and what the full TM sequence accomplishes |

The first case independently verifies that an *earlier* legitimate owner's Tag Call search disclosed absence of a required singleton before a consequential Supporter was played. The second establishes that an *actual* Poffin prompt had two legal source-deck Oddish available and three free Bench slots, yet the automated chooser selected other Basics. The Poffin replay is retrospectively selected. The rank-15 root counter includes setup `Store.dispatch` calls; its ordinals should not be aligned mechanically with the rank-24 observer or `runMatch` root-array indices.

## Minimal shared policy interface

The decision layer needs **two distinct integration boundaries**:

1. **Persistent owner-knowledge acquisition at authenticated search.** At a genuine `ChooseCardsPrompt` owned by the actor, and only when its `cards` really reference that actor's deck, record the visible remaining deck multiset. Derive relevant own Prize facts by matching the known source 60 against currently known zones and preserve whether the player had access to this information. Before first owner search, do not inspect physical deck/Prize truth to decide actions. Track invalidation when actual effects change Prize composition or knowledge.
2. **Prompt-local target selection with a short-horizon goal.** At the same real prompt, choose among *offered* printed cards using the current public board, hand/known resources, Bench and Active constraints, spent Supporter slot, and intended subsequent attack/evolution sequence. The root decision that initiated the search and the prompt's selection decision are different policy operations.

In both interfaces, distinguish **legality**, **physical availability**, **anticipated utility**, and **opportunity cost**. An available Oddish does not prove that spending Poffin on it is optimal. An unavailable Thunder Mountain makes a specific Stadium-fetching branch impossible, but does not independently prove which alternative wins. Avoid globally forcing a particular named card.

A minimal post-search `knowledgeEpoch` can hold `observedAtRoot`, `ownedDeckCountByPrinting`, `visibleBoardFingerprint`, `knownPrizeCardMultiset` (only when legitimately derivable), and `staleness / changes since observation`. The decision branch should compare its required resources against this snapshot before consuming a scarce connector. The prompt resolver should score the legal choices against at least one downstream action or terminal capability, without consulting opponent hand/deck or hidden future draws. Logging the knowledge epoch and the candidate action's *actual* use of it is essential: an observer capturing facts alone does not establish a non-cheating or competent bot.

## Falsification and owner-safe negative controls

- **Unavailable target:** source rank24 seed `2966203069` must invalidate the G&H Thunder-fetch plan after authentic Tag Call K1, without secretly checking the Prize beforehand. Rank24 seed `2804067880` is the positive control with **1 Thunder**, a real fetched Stadium, DCE attachment and native Volt Cyclone. Rank24 `1150814608` finds Thunder absent only inside the already chosen G&H search, a distinct negative control.
- **Available alternate target:** rank15 seed `3050400820` should preserve the native Poffin play with legal three-slot Bench, then compare **actual offered Oddish selection** against the historical Budew/Buneary choice. Validate real Bench change, native TM Gloom/Evolution choices and subsequent opponent actions. A direct Stage2 selection requires the appropriate prior evolution; also account for **Vileplume BUS's Active-only attack suppression** and any Active-switch costs. Preserve the baseline Buneary→Mega Lopunny effect as a real, potentially valuable competing choice.
- Across both tests, compare untouched versus read-only-observed complete root histories, preserve pass/abort/cap outcomes, enforce strictly legal Card/Prompt actions, retain owner information boundaries, and do not promote successful setups into wins without a competitively credible policy.

## Provenance

- [Agent 9 native K1 search report](../aichi-2026/rank24-native-k1-owner-search-policy-failure.md), [Actions 39344467619](https://github.com/FlareZ123/experiment-01/actions/runs/39344467619), archived [artifact 12230690971](https://github.com/FlareZ123/experiment-01/actions/runs/39344467619/artifacts/12230690971), ZIP SHA-256 `adcb0c9efa48d3f37e85cb5a01612aa6a20f0f53f647e013a1882d21ce6ee4cd`. Engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- [Agent 36 rank15 temporal native report](../aichi-2026/agent36-rank15-powered-tm-temporal-source-gap.md); [Agent 30 physical K1 follow-up](../aichi-2026/agent30-rank15-poffin-k1-physical-availability.md), [Actions 39335486263](https://github.com/FlareZ123/experiment-01/actions/runs/39335486263), ZIP SHA-256 `7f601f7cd55edc8bdd212d8dbba8cd50166d68c452f0a07a6b3f5295c0a0413a`; [fail-closed derived audit script](../../scripts/rank15-poffin-owner-choice-audit.cjs).
- [Critic's common-policy directive](../../communications/broadcast/20261019T210802Z_critic_crossarchetype_resource_policy.md).

**Status:** fixed Top32 objective still at **29/32** exact source decklists and **zero competitively qualified matches**; 99.5% remains unproven. These data are architecture-level falsification fixtures, not game win estimates.
