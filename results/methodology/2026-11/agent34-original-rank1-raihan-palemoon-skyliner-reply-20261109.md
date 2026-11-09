# Original Aichi rank1: real Raihan -> two Psychic -> corrected Pale Moon-GX and native Skyliner escape

**Agent 34 | 9 November 2026 | source-dealt, opponent-causal native continuation | no competitively qualified paper game.**

## Decision-relevant result

An authenticated rank1 Aichi original-source replay reaches a unique, public-owner turn18 response after an original-source-detached line: Dimension Valley PHF -> Tapu Lele-GX GRI Energy Drive for 80 on global turn16 -> opponent's actual Latias ex SSP Eon Blade KO -> opponent's two physical Prize cards taken from its own facedown Prize slots (5 remaining to 3) -> source-owned forced promotion of a pre-existing Benched Trevenant & Dusknoir-GX SMP. The original complete source game remains unchanged: exactly **110 accepted original actions**, **12 source Pass actions**, source root SHA-256 `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`, final winner original opponent.

At that **same original source-dealt turn18 state** with Dimension Valley active, Raihan EVS and one Basic Psychic Energy MEE in the source player's real hand, and one Basic Psychic in its real discard, native Store accepted the full physical sequence:

1. Owner-issued Raihan: the game genuinely recognized its prior-turn own Pokémon KO marker; the Supporter was spent.
2. An actual owner-controlled `AttachEnergyPrompt` selected the discarded Basic Psychic and attached it to the original source's Active Trevenant & Dusknoir-GX.
3. Raihan's unrestricted own-deck `ChooseCardsPrompt` selected one genuine physical card, Lillie's Clefairy ex JTG; an actual shuffled permutation was accepted using the existing [Agent33 paper-numeric shuffle validator](../../../simulation/twinleaf/agent33-shuffle-prompt-numeric-validation.cjs). The raw vendor shuffle validator rejects every valid permutation on an 11+ card deck; this older correction was reused without changing vendor code.
4. A second Basic Psychic Energy MEE was actually attached from the owner hand through `PlayCardAction` as the turn's normal Energy attachment. Two distinct real Psychic cards were now attached to the original source Active.
5. The physical paid State was cloned into **two identical full branches**, fixed paid-state SHA-256 `140798ef117df226b2c336501419de0f88e54124593cc5d9bc4406e99e96adec`. Both branches made a genuine, accepted Pale Moon-GX `AttackAction`, spent once-per-game GX, queued exactly one delayed defending Pokémon KO and passed turn to the real opposing actor ID 202.

| Exact same paid State outcome | Uncorrected pinned card handler | Research-only paper-corrected handler |
| --- | ---: | ---: |
| Source Trevenant & Dusknoir-GX attached Basic Psychic | 2 | 2 |
| Opposing Latias ex Active attached Basic Psychic before GX | 3 | 3 |
| Physically discarded opposing Psychic from the accepted GX | **0** | **3** |
| Source GX spent | yes | yes |
| Delayed defending KO queued immediately after GX | 1 | 1 |
| Opposing actor owns next turn | ID 202 | ID 202 |

The paper correction supplies the actually missing additional Energy payoff where [Dimension Valley] reduces the attack's effective cost from [P,C] to [P]. The pinned card instead hardcodes [P,P,C] for bonus eligibility. See the separate [precise original native failure, adapter, and staged two-seat matrix](agent34-dimensionvalley-palemoon-extra-cost-correction-20261109.md).

## Counterplay: delayed Knock Out does NOT force a Prize

The actual original opponent had **a full five-Pokémon Bench** at this exact source position: **Girafarig LOT, Shadow Rider Calyrex V CRE, Lillie's Clefairy ex JTG, Dialga-GX UPR, Shadow Rider Calyrex V CRE**. The frozen native owner-visible source snapshot confirms that **all five Benched Pokémon had zero attached Energy**, while all three Energy in play were on Active Latias ex. The corrected GX therefore temporarily reduces the opposing board's total attached Energy from three cards to zero, even though the delayed KO can be dodged. Its active **Latias ex SSP** has printed **Skyliner**, allowing Basic Pokémon to retreat for zero Energy while the Ability works. After the completed GX, the source-fork opponent was therefore able to choose an already-public Girafarig LOT on Bench and issue genuine native `RetreatAction` even in the corrected branch with **zero attached Energy** remaining on Latias.

The real pinned Store is wrong about the queued Pale Moon target following an Active-to-Bench retreat; our earlier paper-validated, reversible [switch cleanup](../../../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs) was enabled only during these cloned replies to remove that otherwise false delayed KO. The same successful action and paper-accurate cleanup occurred in **both** original and corrected GX arms:

| Owner-reply physical result after legal Retreat and Pass | Uncorrected GX | Corrected GX |
| --- | --- | --- |
| Next opponent Active | Girafarig LOT | Girafarig LOT |
| Original Latias ex on Bench and surviving | yes | yes |
| Delayed GX effects remaining | 0 | 0 |
| False delayed effects cleared by switch hook | 1 | 1 |
| Opponent's actual remaining Prize cards | 3 | 3 |
| Native owner turn returned to original source player ID101 | yes | yes |

This is a legal **existence proof of counterplay** in one exact historical game state. The chosen opponent reply passes without attacking and is deliberately specified rather than claimed optimal. The counterplay defeats any model that automatically credits a two-Prize knock out solely from Pale Moon's initial delayed queue. The corrected GX still physically strips three opposing Psychic Energy, a substantial tactical resource change; opponent ability lock, alternative Bench attackers, other actions, the next source turn and resulting game outcome require a stronger bilateral policy before making win-rate claims.

## Reproducible native receipts

- **[CI 42571552066](https://github.com/FlareZ123/experiment-01/actions/runs/42571552066):** first source continuation 44/45; reached real Raihan, physical discard attachment, owner deck search. Its sole failure was the already-known lexicographic native ShuffleDeckPrompt validator. The existing Agent33 numeric paper hook resolved it.
- **[CI 42571979829](https://github.com/FlareZ123/experiment-01/actions/runs/42571979829): SUCCESS 45/45**, including source physical Raihan, second Psychic, original GX vs corrected GX, three physically discarded Energy under correction.
- **[CI 42572529237](https://github.com/FlareZ123/experiment-01/actions/runs/42572529237): SUCCESS 45/45**, adding genuine opposing native Skyliner free Retreat and source owner's following turn with no queued false KO.
- [Independent source-t16 provenance/owner observation](agent11-rank1-t16-energy-drive-eonblade-native-followthrough-20261108.md), which was not edited or replaced.
- [Source continuation adapter](../../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs), [native test](../../../tests/2026-11/agent34-rank1-original-raihan-palemoon-native.test.cjs), [opt-in Pale Moon correction](../../../simulation/twinleaf/pale-moon-dimension-valley-bonus.cjs). The old source-t16 clone gained a default-off `afterSourcePromotion` callback seam; ordinary source tests and original actual Store flow are unchanged.

**Qualification:** one original historical physical deck and one active opponent state, deliberately chosen Owner and Opponent responses in cloned Stores, no assumption of opponent hidden-hand knowledge for decision selection. A real printed attack, Supporter, normal Energy attachment, deck search/shuffle, native opponent retreat, and competing GX resource outcomes are proved; any full-game policy strength, clock qualification, cross-field matchup win fraction, paper-card legality of all cards in the original field, and the 99.5% fixed-deck objective remain unproved. Source field still authenticates 29/32 original opposing lists, with ranks23/25/28 missing.
