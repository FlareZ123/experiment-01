# Owner-observation-only held Guzma fallback: type-safe printed funding bridge

**Agent 2 | 21 October 2026 UTC | experimental research-side policy.** This is a source-agnostic selection proposal, not a native Store acceptance or a measured game result.

## Objective and authentic antecedent

The same physical source-first rank11 New Moon development deal exhibited source-owned **Guzma BUS held through T9, T11 and T13**, with unused Supporter entitlement at each of these turns, after genuine source T7 Marnie. Agent43's [three-arm native intervention](../aichi-2026/agent43-sourcefirst-held-guzma-native-20261021.md) successfully played Guzma at T9 and switched the source Garbodor to its already invested Oranguru V, but its unchanged source policy still recorded zero attacks. Agent17's [Energy diversion audit](../aichi-2026/agent17-rope-source-energy-diversion-audit-20261021.md) independently found the post-Rope bot had diverted two Darkness attachments into active Garbodor.

Rank11 registered [exact source list](../aichi-2026/full-decklists.json) has **eight basic Darkness Energy, no Psychic Energy and no Special Energy**. Supplied card-pool `Garbodor BKP 57` has `Offensive Bomb` costing `[Psychic, Colorless, Colorless, Colorless]` and an untooled retreat cost of three. A Darkness Basic cannot itself satisfy the compulsory Psychic symbol. Its nominal printed-cost gap may therefore fall as Dark is attached even though that attack remains unavailable from ordinary cards in the registered Energy inventory. Any alternate type-transforming effect would need to be separately established; this statement does not certify all hypothetical gameplay effects.

## Reversible implementation

- `simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs`, initial commit `5f2dc905`, later conservative Special-Energy guard `13b14f97`.
- `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, opt-in integration at commit `1a1edbbc`. The flag is `heldGuzmaMobility:true` (injected dependency) or `AGENT2_HELD_GUZMA_MOBILITY_DEV=true`. **OFF by default**.
- At the **final root fallback** after owner-visible setup, attachment, attack, special-energy and paid retreat options, choose a held printed `Guzma` Supporter only if the owner's unspent Supporter quota and absence of Supporter lock are observable, each side has a public Bench, a current damaging Basic-funded Active attack is unavailable, and an Energy-invested own Bench attacker has a stronger printed funding path.
- Public Basic attached Energy and numeric printed non-GX positive-damage attack costs determine the route. An unknown attached Special Energy on Active or Bench fails closed. A Benched attack with fewer missing symbols wins; equal missing totals favor fewer unsatisfied colored requirements. Printed names exclude the distinct Tag Team `Guzma & Hala`. The native root creates a standard `PlayCardAction` with `PlayerType.ANY` / `SlotType.BOARD`, matching the actual accepted Agent43 source-owner Guzma root.
- The chooser reads only the actor's own hand and publicly visible cards, turn/quota/locks and opposing *public* Bench geometry; it does not consult opponent concealed hand, deck, Prize cards or source rank/identity.

## Verification

I executed an isolated, source-bound CommonJS/V8 harness over the **actual fetched GitHub module sources** of both new helper and integrated root, with restricted Node assert and import stubs. **16/16 deterministic checks passed:** exact Guzma recognition, reconstructed source-like Garbodor-vs-Oranguru cost route, legacy default Pass and opt-in Guzma, spent Supporter, first-turn restriction, owner/public lock, both empty Bench cases, preserving funded Active attack, worse Bench rejection, unknown Bench Special Energy, GX exclusion, false `Guzma & Hala`, and opponent-hidden-identity noninterference.

An additional **source-bound typed translation test** injected minimal `Store`, `SimpleTacticsAi`, `AddPlayerAction`, and `PlayCardAction` stand-ins through the existing `withActorOnlyRootPolicy` wrapper. It selected one owner-turn intent and produced `PlayCardAction(ownerId=11, handIndex=0, target={player:3,slot:0,index:0})` with `play-held-guzma-mobility:1` in the wrapper audit; both prototype methods were restored afterward. The mock's enum constants `3` and `0` are test fixtures, **not independently authenticated pinned engine constants**. No native `Store.dispatch` settlement was asserted.

This validates pure branching in the source as fetched on 21 October. It **does not run the pinned native Store**, authenticate the original T9 energy targets, settle the opponent-first Guzma prompts, establish the source actor's new subsequent attachments or attacks, or prove strategic superiority. A dedicated Node test-file GitHub write was blocked by the available tool's safety checks; the source-bound V8 test evidence and its exact scope are preserved here instead of claiming compiled CI.

## Next necessary experiment

Use the shared canonical rank11 source-first physical deal as a regression **only** to confirm whether enabled `mobilityAwareRecipient` plus `heldGuzmaMobility` can genuinely choose the T9 Basic attachment recipient, dispatch held Guzma on a subsequent same-turn native root, complete both switch prompts, then invest future Basic Energy to fund a printed attack. Compare original OFF/OFF, recipient-only and joint ON in the same source-first native runner with identical lists, deal and pinned vendor. Record both physical CardAction witnesses, game outcomes, caps, rejections, source continuation and the opponent's later replies. Next preregister independent physical seeds under the same both-seat common policy, including unfavorable exposures. Source-first rank11 one-deal terminals are **never** competitive-qualified.

The shared benchmark remains **29/32** exact attributed opponent 60s, **zero** competitively qualified matches, no qualified fixed 60 and no substantiated 99.5% performance.
