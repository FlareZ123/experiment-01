# Agent26: make Lockbridge's Girafarig Get Lost executable across root and opponent-public discard prompt

**28 November 2026. Research-only branch:** [agent26/lockbridge-getlost-native-prompt-20261128](https://github.com/FlareZ123/experiment-01/tree/agent26/lockbridge-getlost-native-prompt-20261128). **Fixed Hood Shield and Lockbridge 60s unchanged.** No native Store, CI, match, worker release/registration, game, win rate, or promotion.

## Specific action gap and executable correction

The exact pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` source at `ptcg-server/src/sets/08-sun-and-moon/set-lost-thunder/girafarig.ts` defines **Girafarig LOT 94**, **Get Lost** ([Colorless]): `Put 2 cards from your opponent's discard pile in the Lost Zone.` The card executes a `ChooseCardsPrompt` with `player` as the chooser, **`opponent.discard`** as the card list, and `{min:2,max:2}`; its callback moves the selected physical cards to `opponent.lostzone`.

The existing candidate worker `simulation/evaluation/2026-11/agent46-candidate-policy.cjs` at Git blob `59466565caa241558c3ed62a331c56228c30e3d1` has two gaps:

1. Its root scoring finds zero-damage Get Lost in the native attack frontier but selects Pass rather than it when no scored positive attack or other scored action exists.
2. Its generic `chooseCardCombination` insists all visible card choices have `ownerSeat:'actor'`. Current V3 `projectChooseCards` correctly classifies **opponent-public discard** as `sourceZone:'discard',ownerSeat:'opponent',isOwnerVisible:true`; thus the mandatory prompt produces `UNTRUSTED_CARD_SELECTION` even if Get Lost is reached.

The [branch policy patch](../../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs) adds a **source-exact, non-generalized exception** only for `Girafarig LOT` / certified `Girafarig LOT 94`, attack/effect `Get Lost`, the current actual offered attack action, and a typed opponent-public discard prompt. It scores no imagined actions. The root chooses Get Lost *instead of Pass* only with own Active Girafarig, live Temple of Sinnoh, visible opponent Regidrago VSTAR and opponent-public discard containing both Megaton Blower and Crispin; it deliberately does **not** override a useful competing attack, an already-selected play, retreat, Resetting Hole, or an offered Underworld Door. The prompt selects **two actual physical card tokens**, Megaton Blower then Crispin, from the trusted owner-opponent discard projection. All other opponent-owned card prompts still abstain. Failure codes use the current strict protocol codebook; no protocol or native engine change.

This is an **actor-visible denial attempt**, not an automatic lock verdict. The preceding [rank13 conditional Temple calculation](agent26-rank13-temple-attack-cut.md) shows why this pair matters in an exact constructed source state (Temple already established; two source Stadiums Lost; G+DDE Regidrago funding geometry; no KO enabling Raihan; no another funded attacker); the current root gate deliberately does **not** infer all those nonvisible or future conditions. If another accessible removal/funding route survives, a Get Lost double cut can still fail to deny Apex. No hidden deck contents, inferred opponent Prize cards, source rank labels, or future draws enter the worker.

## Executed decision/continuation and negative-control receipt

Exact evaluated branch worker blob `cac94ddff4d672e54b66e88cb1807e0701bc314a`; strict public worker protocol blob `d8349ae6f3537816b357b8309e9ab140ddec51eb`; exact V3 prompt projector blob `bb1dade971632916f6bb029371ce32db55d2b884`. [Tests](../../../tests/2026-11/agent26-lockbridge-getlost-root-prompt.test.cjs) blob `2e3b0c6abc038cbc4a2acf93dd426f728a082287`.

Two **physical actor seats 0 and 1** each produce this baseline-to-branch reversal on constructed public observations:

| Stage | Sealed main candidate | Branch candidate |
| --- | --- | --- |
| Root: offered `attack-get-lost` + `pass` | `select-action(pass)` | `select-action(attack-get-lost)` |
| Mandatory `ChooseCardsPrompt`: opponent-public discard `[Dialga,Crispin,Megaton,Kyurem]`, min=max=2 | `abstain(UNTRUSTED_CARD_SELECTION)` | `select-choices(choice-2,choice-1)` |
| Current V3 projector choice tokens (synthetic native object graph) | Not handled by existing worker | `prompt-2,prompt-1` map to physical native indices `[2,1]`; `Megaton Blower,Crispin` |

**32/32 focused two-seat cases** and **19/19 unmodified candidate worker regression callbacks** executed against exact fetched final worker in the V8 in-process JS harness, including **protocol `validateRequest`, `validateDecision`, and `validatePolicyAudit`**. The 32 include a live execution of current V3 `projectPrompt` on an exact-class fake `ChooseCardsPrompt` and synthetic zone-identity graph; genuine `choiceByToken` maps the chosen tokens to native indices, and the fake prompt's validate method accepts those indices. The current native Store **was not** compiled, instantiated, dispatched, or settled. In particular a fake prompt class/validator **does not** certify actual pinned Twinleaf `ResolvePromptAction` or real source provenance capture.

Hard controls preserve Pass/abstention when the Stadium is absent, the opponent isn't Regidrago VSTAR, either public cut target is missing, an Underworld Door action is offered, the prompt is owner-spoofed/concealed/min-cardinality-mismatched, source printing is unrelated, or requested cut pair is not physically in the prompt; two physical Megaton copies select only the first plus one distinct Crispin. Existing candidate tests still pass. No CI or games were dispatched.

## Production and competitive interpretation

This patch is a **developmental decision slice on the older sealed main candidate-worker lineage**. It is **not a replacement for Agent32/Agent1's deeper PR #95 Underworld Door/typed-Energy/second-engine fixes or Agent46's separately owned two-profile successor**; do not wholesale merge it over newer owner work. The smallest next integration is to transplant only the typed Get Lost source check, source-exact opponent-discard pair selector, and optional Pass override into the reviewed owner worker after comparing terminal and engine priorities. Independent reviewer should confirm the actual pinned source-provenance hook emits `Girafarig LOT` and `effectName:'Get Lost'` all the way through a real Store effect; that **first native gap** remains unexecuted, and no native run is authorized here.

This does not change the honest aggregate: **29/32 original Aichi source inventories available; 0/32 qualified game matchups; no selected final 60; 99.5% not shown**.
