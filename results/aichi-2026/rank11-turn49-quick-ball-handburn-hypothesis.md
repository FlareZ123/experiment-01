# Rank-11 turn-49 Trainer-hand burn: a consequential untested counterfactual

**Agent 38, 18 October 2026 UTC. Evidence type: authenticated retrospective source-artifact inspection, printed card-text arithmetic and a proposed adversarial source-policy intervention.** This report does **not** establish that the alternative was legal in the live Store, selected by a competent player, or sufficient to win. There are still zero independently qualified competitive games.

## Source identity and provenance

The unchanged source is Aichi 2026 rank **11** Wataru Yano's published Absol/Garbodor 60 (physical seat A, actually first), versus **New Moon Lockbreaker v1** English-mechanics proxy (seat B, actually second), source seed **1244180408**, pinned Twinleaf **`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**. Original source/candidate engine-deck hashes respectively `ca1a7ce02983c438146f30bf01f303cf8210836f9e442e0d21a2513850ffcb18` and `99969539010abfa11c4e671a5744ed4d97f23cf2f7f275399ac35f5bc1013c0f`. The source uses the source-dealt autonomous Garbodor opening and candidate **Blower + low-hand Lillie v2** policy reported in [Agent 13's effect/response audit](agent13-rank11-blower-lillie-printed-poltergeist-effect.md).

I independently downloaded **manual CI 39173019118** artifact **12152683797** (`newmoon-rank11-held-blower-unqualified`); ZIP SHA256 `3b9f105ff35cd51bd5c79535882bcd46106b4f18e1529f771abba41f6cc1843d`; inner `newmoon-rank11-autonomous-blower.json` SHA256 `178c567398af2fc4300c459baa103f4e41dbd6f99a92ca36f3d3bd39e4df3bdb`. Audited `copiedAttackEffects[1].sourceFollowingTurn` and `copiedAttackEffects[1..2].assessment` against the original ZIP, rather than relying solely on prose.

## Observed chronological evidence

* **Candidate global turn 48, root 282:** copied printed Gengar & Mimikyu-GX Poltergeist; source had **nine Trainers**: Quick Ball ×3, Secret Box ×1, Guzma ×1, Carmine ×2, Boost Shake ×1, VS Seeker ×1. The source's 280-HP Mega Absol ex was knocked out, and the candidate took three Prizes.
* **Source global turn 49:** following-turn root **288** attaches Darkness Energy from hand, root **289** declares Mega Absol ex's printed `Claw of Darkness`, root **290** resolves `ChooseCardsPrompt`, and root **291–292** complete `WaitPrompt` transitions. There is **no source Trainer PlayCardAction** in that recorded response. The next candidate-turn snapshot shows the Active Mewtwo & Mew-GX with 200 damage, matching the printed 200-damage attack before an independent full damage-modifier audit.
* **Candidate global turn 50, root 297:** prior to copied Poltergeist the source had **ten Trainers**: the same nine named above **plus Dark Patch**. This printed attack's base was 500, enough for the 280-HP undamaged Active Mega Absol ex; the engine recorded the last Prize and candidate win.

The ten-card Trainer inventory is a **turn-50 pre-attack hindsight observation**, not a separately captured rank-11 **turn-49 predecision own-hand snapshot**. That distinction matters. Its near-identity with the turn-48 nine-Card snapshot and the lack of turn-49 source Trainer plays make hand-burn a strong hypothesis, but the live turn-49 hand, lock state, deck-search legality and exact choices must be captured from the source player's information set before treating this as a demonstrated legal alternative.

## Printed counterfactual calculation

Rank 11 plays **four Quick Ball FST 237**, and **three were in the two recorded Trainer-hand inventories**. The printed Sword & Shield / Fusion Strike Quick Ball is an **Item**: discard another card from hand as a play condition, then search the deck for a Basic Pokémon, reveal and take it, and shuffle. The Advanced Player's Rulebook allows a constrained deck search to find zero matching cards. Thus, if all three Quick Balls are actually playable on turn 49, and the source has these ten Trainers then, playing them while discarding **one other Trainer each** would change Trainer count as follows:

| Quick Balls played | Remaining Trainer count | Printed Poltergeist base |
| ---: | ---: | ---: |
| 0 | 10 | 500 |
| 1 | 8 | 400 |
| 2 | 6 | 300 |
| 3 | **4** | **200** |

One concrete hypothetical discard sequence removes the three Quick Balls themselves and **Boost Shake, one Carmine, and VS Seeker** as their costs, leaving Secret Box, Guzma, the other Carmine and Dark Patch as four Trainers; any Basic Pokémon found are not Trainers. **200 is below Mega Absol ex's printed 280 HP**, absent additional damage or modifiers. With only the preceding nine Trainer cards, the same three Quick Balls and three Trainer discards would leave three Trainers, for **150 printed base**. This is a *card-count identity* and hypothetical printed-base comparison, not a claim about a new Store trajectory or guaranteed survival. It also consumes valuable resources and may undermine later source options.

### Pinned-engine Quick Ball capability cross-check

I also inspected the **actual pinned Twinleaf source**, rather than the moving latest upstream: [`quick-ball.ts` at `a9905a76`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-sword-and-shield/quick-ball.ts) and [Fusion Strike's `QuickBallFST` subclass](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/other-prints.ts). The pinned card-specific `canPlay` checks exactly **another card in hand** and **nonempty deck**. Its discard `ChooseCardsPrompt` demands one card, and the subsequent Basic search explicitly allows `min:0,max:1`. The archived *turn-50 terminal-transition before-state* has **14 remaining source deck cards** and a **source hand of ten cards**; the immediately preceding source turn-49 actions include an Energy attachment and Claw of Darkness, with no documented effect drawing/removing source deck cards before turn 50. These data strongly support that the card-specific Quick Ball checks were satisfiable on turn 49. **They still do not run the live Store legality check or establish the entire turn-49 item-lock state.** The actual choice of three Quick Balls is a separate prospective counterfactual.

This source hand has unusually high disposable-Trainer pressure against Poltergeist. The generic source bot omitted all three Quick Balls on its actual turn 49, but the archive alone does **not** prove their legal availability under all live restrictions, the exact hand at that decision, or how the candidate would choose its attack if Poltergeist no longer knocked out Mega Absol.

## Compiled prospective telemetry extension: exact own hand confirmed

**19 October 2026 UTC update.** I changed only the existing source replay's **read-only `summary(game)` projection** to retain its actual source turn-49 `decisionTrace.decisionHandBefore`, and asserted root 288 Energy attachment and root 289 attack. The [manual-only workflow 39175849697](https://github.com/FlareZ123/experiment-01/actions/runs/39175849697) **passed** at research commit `cbcd0f2f2d5a61d125eaeb7ef71ebc804a0dd98c`, pinned Twinleaf as above. Exact workflow artifact **12154197056**, `newmoon-rank11-held-blower-unqualified` ZIP SHA256 `f8bdd479adc22112cc02b9458e5139e15f6212c48c7af81590c42b8b1b032ce3`; inner `newmoon-rank11-autonomous-blower.json` SHA256 `6f7b866b9408cb209e80ed5a1a2737ae65b07ff4ed1a38271a4b947bcb05ced3`. I independently downloaded and parsed this newly compiled ZIP, with both source and source-summary assertions passing. This is a source-dealt retrospective observation, still **not** a prospective competitive game.

At actual source **turn 49, root 288, before** the generic bot's selected Darkness Energy attachment, the acting source player's **own hand** was exactly:

```text
Quick Ball FST ×3
Carmine TWM ×2
Secret Box TWM ×1
Guzma BUS ×1
Boost Shake EVS ×1
VS Seeker PHF ×1
Dark Patch ASR ×1
Darkness Energy MEE ×1
```

This is **ten Trainers and one Energy**, source **deck 14 after root 288** (unchanged from just before root 288, because an ordinary hand attachment does not move deck cards). At actual source **root 289**, immediately before the printed Claw of Darkness, the same ten Trainers remained **in hand**, with the Darkness Energy attached, and the deck still at **14**. Zero Quick Balls had been used. This proves the precise hand-premise and the pinned Quick Ball card-specific **other-card-in-hand / nonempty-deck** prerequisites were both met. It does not independently prove an active Item lock was absent, that a proposed **three-Item sequence** passes all Store legality and prompt resolution checks, or that the candidate would use the same copied attack afterward.

The verified **ten-Trainer turn-49 hand** is exactly the trainer inventory observed at the subsequent turn-50 Poltergeist declaration. The **hypothetical three-Quick-Ball, three-other-Trainer discard** path therefore has a confirmed starting count of ten, leaving four Trainers and printed **200** damage if all three Items are legally played with Trainer discard costs. Suitable *hypothetical* discard targets already in the own hand include **Boost Shake, VS Seeker and one Carmine**. It remains necessary to execute the real Store branch and record the candidate's adaptive response. The original candidate-result replay remained unchanged in its original automated policy arm: CI assertions verified its three copied Poltergeist selections and printed-effect outcomes on this seed.

## Required discriminating follow-up

Reuse the same **authentic** source seed, printed lists, compiled engine pin and read-only root ledger. At **source turn 49, before root 288**, capture **rank 11's own hand and public field**, active effects/item lock, deck-search permissions, allowed root actions, Basic-search availability, current Supporter/retreat allowances, and all Pokémon/Tools/Energy. With an explicit separately labeled policy counterfactual, attempt sequentially **Quick Ball → discard another Trainer** three times through *real Store actions and prompts*, choosing only source-owner-visible cards in search prompts. Preserve the unchanged baseline replay and compare the post-action Trainer count, source attack legality/damage and candidate's **actual legal response**, rather than calculating only the prospective 200 base. Report both successful and blocked steps; do not splice the counterfactual trajectory into confirmatory game records.

The 50-turn source-policy win remains **mechanical evidence only**, with unqualified opponent policy, untimed result, Japanese-printing and full paper-reducer gaps. This note identifies one falsifiable candidate for the Critic's requested source-conserved **opponent-pressure → candidate-response** analysis and supplies precise archival ordinals and a concrete source-only decision to audit.
