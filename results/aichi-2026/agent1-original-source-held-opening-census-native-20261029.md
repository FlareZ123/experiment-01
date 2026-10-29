# Original-source T1 physically held resources: 5/6 rank11 VIP, 5/8 rank6 Speed, with 32/32 zero-change Store replay

**Agent 1 | 29 October 2026 UTC | Evidence classes: postdecision native Store own-hand observation, exact original source physical deals, pinned printed-card canPlay code.** This is an owner-visible opponent **policy competence** audit; it is not new fixed-deck win-rate evidence.

## Provenance and strict replay equivalence

Use the **previously preregistered** [Agent41 source-first 32-arm canonical scout](registrations/agent41-prospective-canonical-32-20261029.json) at engine **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**, with exact rank6/rank11 opponent 60s and unchanged champion-reference/New Moon candidate 60s. Original [compiled CI 40918541683](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683), [ZIP artifact 12917901362](https://github.com/FlareZ123/experiment-01/actions/runs/40918541683/artifacts/12917901362), SHA256 **`55ef8029bce341803da3f895246509cc61480e42a840d35fe34d6ab12f294ad2`**.

New read-only inspector [agent1-source-first-owned-affordances.cjs](../../simulation/evaluation/agent1-source-first-owned-affordances.cjs) consumes the canonical runner's **already existing native decisionTrace** and its detached `decisionHandBefore.ownHandPrintings` (the acting source player's own-hand perspective, sampled after the bot chose each action). It reports counts of selected original printed resources at the source's **first own-turn root and first actual Pass**, without exposing the other player's hand or feeding private information into the AI. Six standalone pure regressions cover owner-seat filtering, first/second real starts, redaction, and incomplete witnesses. Integrated with [the canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) as the new, additive `sourceFirstOwnedAffordances` row field.

Actual new [manual CI 40935634433](https://github.com/FlareZ123/experiment-01/actions/runs/40935634433), [raw artifact 12925706010](https://github.com/FlareZ123/experiment-01/actions/runs/40935634433/artifacts/12925706010), archived ZIP SHA256 **`29b2db5dd5717f6e09ac9831a6fcb3cf2963984fe12fade8e7d64302b3a22b76`**, compiled pinned Twinleaf and passed the source-own-hand pure tests. Reran the **identical frozen 32-arm original scout**. Independently compared all 32 arms one by one to the original artifact:

| Exact field of the frozen attempt | Changed records |
| --- | ---: |
| Preregistration blob and all-attempts outcome census | **0 of 32** |
| Source physical deal fingerprint | **0 of 32** |
| Complete bilateral physical setup fingerprint | **0 of 32** |
| Native accepted rootActionLedger SHA256 | **0 of 32** |
| Candidate and source printed 60 fingerprints | **0 of 32** |
| Actual first player and source-first status | **0 of 32** |
| Action count, exception, cap, completion and winner labels | **0 of 32** |

**Read-only observation did not alter any archived native root or outcome.** The additive owner-hand evidence is `observed` in **30 of 32 arms**. Two rank11 source-second arms lack a complete first-own-turn Pass witness; those remain `incomplete`, rather than inventing data. Every source-first arm is observed.

The overall workflow's final job status was **failed for a separate, legitimate preregistration hash guard**: an existing Source-Supporter Marnie/Carmine paired study expected the old canonical source-file Git blob `64ad19f6b33be8c760a6ea526e6cfd3bd43f56c0`, while the additive observer changed the source file blob to `32147eb319201f3ca33f069184f4c787fe6ecabd`. That study correctly aborted before its own run. Its frozen manifest was **not changed** and its study is **not presented as completed by this CI**. The 32-arm scout and other earlier steps did complete and the full original and new JSON remains archived.

## Rank 11: real Battle VIP Pass held, unplayed on five distinct source-first deals

Rank 11 is [Wataru Yano's exact Absol Garbodor original 60](full-decklists.json): 4 VIP, 4 Quick Ball, 3 Carmine, 2 Boost Shake, 2 Trubbish, 2 Garbodor and 6 eligible Tools. **12 source-first game arms represent six physical source deals**, because each different candidate 60 uses its own original deck but the source 60 was identically dealt in each paired case. In all six the T1 native bot **played no Item, Boost Shake or Carmine** and then Passed. The new read-only receipt reveals exactly what the source held before its native first-turn Pass:

| Registered source seed | First actual native action | Held at native final T1 Pass | Own public board at Pass |
| --- | --- | --- | --- |
| `3149897025` | Darkness Energy | **Battle VIP Pass** | Latias ex Active, Mega Absol ex Bench |
| `340754762` | Tapu Lele-GX | **Battle VIP Pass** | Oranguru V Active, Tapu Lele-GX Bench |
| `2246176619` | Darkness Energy | **Battle VIP Pass, Quick Ball** | Crobat V Active, empty Bench |
| `3403930699` | Pass | **Battle VIP Pass, Boost Shake** | Mega Absol ex Active, empty Bench |
| `2147808079` | Crobat V | **Carmine** | Mega Absol ex Active, Crobat V Bench |
| `1254634394` | Crobat V | **Battle VIP Pass, Quick Ball, Carmine** | Oranguru V Active, Crobat V Bench |

**Five of six independent physical first-turn source deals retained an unplayed VIP at native Pass. Two retained Quick Ball; two retained Carmine; one retained Boost Shake.** No source-first observed early hand had Trubbish or Garbodor at the first root, so the held VIP is especially relevant for accessing a Trubbish. Every VIP-holding source finished its first turn with fewer than five Pokémon on the Bench; the [pinned first-turn VIP canPlay](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/battle-vip-pass.ts) requires the opening turn, nonempty deck and an open Bench slot, all plainly compatible with these states. **An independent actual alternative PlayCardAction root and completed native search prompt have not yet been dispatched in these five snapshots.** Therefore this is a documented **held/unplayed affordance gap**, not proof of five fully certified, strategically superior VIP lines.

The prior [first-eight combinatorial note](agent1-rank11-sourcefirst-direct-eight-opportunity-20261029.md) had only the 6.45550612% strict direct Shake+Tool+(Trubbish/VIP) raw-location chance. This new archive closes the previously missing **actual held-resource** denominator, while the K0 owner-search and subsequent full-line efficiency remain open.

## Rank 6: source-first Speed Lightning held while Pass is chosen

Rank6 is [Kazuma Kashi's exact Iron Thorns ex-only 60](full-decklists.json) with four Speed Lightning, four Iron Thorns ex as its only Basics, a single DCE, two Tag Call and two Guzma & Hala. Fourteen source-first game arms correspond to **eight physical source deals** because the two candidate arms at `861838028` have genuinely different source original setup fingerprints. Every one of the eight native T1 sources ended in Pass without any played card:

| Source seed and distinct deal | Held Speed Lightning Energy at T1 Pass | Other relevant held source cards |
| --- | ---: | --- |
| `1460221882` | 0 | Tag Call |
| `2906058002` | 0 | None in selected census |
| `1492669092` | 0 | Tag Call |
| `651983417` | **1** | Trainers' Mail |
| `1954526372` | **2** | None in selected census |
| `3622671892` | **1** | None in selected census |
| `861838028`, champion original deal | **1** | Trainers' Mail |
| `861838028`, New Moon original deal | **2** | Tag Call, Trainers' Mail |

**Five of eight distinct source-first physical deals actually held Speed Lightning at the first Pass**, while no source Speed was attached on the opening turn. In all eight the public Active was Iron Thorns ex with no Energy attached at that Pass. The source first-turn Energy attachment was unspent in the accepted action ledger. This substantiates an **owner-held action-coverage gap** that the earlier [Agent21 rank6 observational audit](agent21-rank6-firstturn-speed-staging-audit-20261029.md) had left unresolved because it only had an opaque source hand SHA.

The existing [Agent39 rank6 Speed-stage option](agent39-rank6-speed-stage-source-20261029.md) already offers a strictly owner-visible `stageSpeedLightningFirstTurn` on exactly this kind of source-hand/Active resource state; [Agent8's pinned native fixture](agent8-rank6-speed-dce-unstadiumed-bypass-20261029.md) establishes the conditional attack-cost validity after Speed and DCE are attached on separate turns. Neither proves first-turn staged Speed would improve game outcomes, especially when passive **Initialization lock** can exert pressure without attacks. Rank6 can pursue control and deck-out instead of early KO. Real live Store eligibility and longer-turn effects remain to be checked.

## Next falsification and qualification boundary

Use **the existing canonical actor and source-deal runner**. Create one explicit development-only, default-off native legal-action probe for a source-held first-turn VIP and a source-held first-turn Speed, compare the actual accepted Store root and prompt/board effects against its unchanged original same-physical-deal control, and preserve all new errors and source responses. The [both-seat VIP bridge](../../simulation/twinleaf/agent7-common-vip-pass-bridge.cjs) and [rank6 Speed-stage actor](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) already exist; do not fork new full-game engines. If a policy is later modified, register a **fresh independent trial cohort** with frozen code hashes and all failures retained before comparing fixed sixty decks. Do not update another study's preregistered source hash merely to force a successful workflow.

The benchmark remains **29/32 exact Aichi Top32 source lists**, **0 competitively qualified games**, **no demonstrated 99.5% deck**, and no calibrated event clock. The new proof is about **what the existing bot actually held and declined to play**, with unchanged native outcomes and direct source-deal reproducibility.


## Mechanistic root cause: canonical actor branch omission, confirmed in all 32 archived rows

The compiled native **generic** SimpleBot has `PlayTrainerTactic` and `AttachEnergyTactic`, but this specific 29 October scout did **not** use generic SimpleBot as the normal owner-turn root chooser. Its [canonical actor-only composition](../../simulation/evaluation/agent7-canonical-actor-composition.cjs) routes actual player-turn roots through [`chooseActorRootIntent`](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), preserving generic fallback for unresolved prompts and setup only. The existing archive's per-arm `actorOnlyDecisionCoverage` records this actual behavior.

Across **32/32 source/candidate game arms**, all of `specialEnergyRootOptIn`, `quickBallRootOptIn` and `thornsDirectLineOptIn` are **false** in `actorOnlyDecisionCoverage.detailedComponentAudits.root`. The generic fallback `nativeGenericDecoderBySeat.*['owner-root-or-setup']` count sums to **zero across both players and all 32 arms**. The original actor-only intent tree has an unconditional supported **Basic Energy** root if held and the manual attachment allowance is available; it has **no general Battle VIP Pass root**. Its special-Energy root is explicitly gated behind `specialEnergyRootOptIn`. The extra Thorns DCE direct line is off; source-only Boost Shake wrapping can still intercept on its own narrow prerequisites.

In the 26 game arms with source actually first, the read-only trace recorded **26 source-side native first-turn `pass` intents**, plus 10 `attach-basic-energy` and six `bench-basic` intents before those Passes (these are 26 game arms, **not 26 independent physical source-deal exposures**). The 14 original rank6 source-first arms had only a `pass` on turn one, consistent with its printed 60 containing zero Basic Energy. The original rank11 source-first arms could use Basic Darkness attachments or Basic Bench plays, but could never select VIP via the actor root tree. The key defect is therefore **an explicit missing supported action in the frozen decision policy**, independent of whether the original generic SimpleBot might have scored the same play differently.

This limits interpretation of the 5/6 and 5/8 observed held-resource gaps: **the frozen policy is known to exclude those actions by construction**, and the independent proposed VIP and Speed alternatives still require real Store action acceptance and strategic outcome validation. The immediate repair target is a general owner-visible *first-own-turn* VIP, special-Energy, and applicable Supporter action coverage layer, with native legality and card-affordability gates, validated across every source 60. The missing branch cannot be repaired by changing a generic SimpleBot score while the canonical actor root explicitly intercepts before that generic scorer is used.

This conclusion comes from inspected [frozen pinned actor source](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), the already published [actor composition wrapper](../../simulation/evaluation/agent7-canonical-actor-composition.cjs), and **actual version/flag/typed-intent receipts in all 32 native rows**, rather than from an imagined human line.


### Clarification of the two source-second missing-Pass receipts

The two `status:incomplete` observer rows are **`11:1:A:champion-reference` and `11:1:A:new-moon-lockbreaker-v1`**, a physically paired rank11 source-second deal. They **do have a complete first-own-turn hand witness** and a genuine original-Store **successful Boost Shake evolution**. Their first own-turn native roots at global turn2 were `PlayCardAction Trubbish`, `PlayCardAction Float Stone`, `PlayCardAction Boost Shake`, then real `ChooseCardsPrompt`, `ChoosePokemonPrompt`, `ShuffleDeckPrompt` and `WaitPrompt` resolutions. The last prompt carried `turnBefore:2, turnAfter:3`, and the existing source lock audit reported `completed:true` with next-turn equipped Garbodor. No separate `PassTurnAction` occurred because Boost Shake **itself ends the turn**. Thus these two `incomplete` codes mean only **the first-Pass-specific field was absent**, and should **not** be counted as failures of the real Store source turn, nor as an undefined owner first-hand.

The core 5/6 rank11 VIP and 5/8 rank6 Speed findings deliberately use **source-actually-first** distinct physical deals, all of which had genuine native Pass witness, so this special successful evolution does **not** change either denominator or opportunity result. A future generic observer should classify legitimate turn-ending card effects and attacks separately from missing evidence.
