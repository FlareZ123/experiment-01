# Rank-6 source-first T34: two Psychic Energy copies remain in the owner's deck

**Agent 8 | 21 October 2026 | original pinned Twinleaf Store replay, read-only observer | zero competitive-qualified games**

## Question and claim

In the same historical rank-6 Iron Thorns ex source-first/New Moon Lockbreaker experiment, does the genuine candidate still have two Basic Psychic Energy available in the deck at turn 34, when the actor holds two Battle Compressor PHF and two Powerglass SFA but passes with one Basic attached to Active Galarian Articuno V?

**Evidence-qualified answer: yes under this exact logged Store trajectory.** The authenticated owner-deck searches show three copies in the actual owner's deck at global turn 16, and the public/owner-visible zones at T34 contain only the single Basic attached to Articuno. From T16 to T34, recorded native owner roots expose only one Basic Psychic attachment (T20) and no card or attack that moves these cards into the face-down Prizes. The source's printed Volt Cyclone merely deals damage and moves its own Energy to Bench. The two residual owner Basics are thus still deck-resident. This is a **resource availability statement**, not evidence that a Compressor/Powerglass policy executes, attacks, wins, or is competitive.

## Reproduction and source provenance

- Manual CI: [39667865342](https://github.com/FlareZ123/experiment-01/actions/runs/39667865342), full source-first four-arm ZIP [12378760922](https://github.com/FlareZ123/experiment-01/actions/runs/39667865342/artifacts/12378760922), downloaded SHA-256 `c3169a322dc47c4b72d59b8e51b62ef31d2d8b4da69e7c93495cd618e260cd02`.
- Checkout `ea9a851ca289fcebe84db1745b536119cd0cefd0`, native engine pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, owner audit changes on branch `agent8-near-term-damage-recipient-20261021` commit `a389155b4cb5ab57c901f8ba8c47d8469a9c5e7a`.
- Manual workflow remains `workflow_dispatch` only and also executes new `tests/owner-compressor-opportunity-audit.test.cjs` in its pure-test phase. No workflow is triggered on every commit. The overall workflow is red on the **pre-existing original candidate-first rank-6 chronological epoch integrity check**. The source-first strict Ace Trainer paired receipt succeeded; all four original physical root digests were unchanged from the earlier archived baseline [39662310666](https://github.com/FlareZ123/experiment-01/actions/runs/39662310666).
- Actual opponent/candidate source-first rank-6 deck, seed `407516727`, candidate physical seat B=1; physical source deal digest `14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de`.
- Exactly **three** `Psychic Energy MEE` are in the unchanged `results/als/new-moon-lockbreak-english-proxy-60.json` candidate 60. No Basic Psychic of another printing occurs in that list.

## Actual owner-zone evidence

The search observer `withOwnerDeckSearchWitness` runs only while an **unresolved native ChooseCardsPrompt** points to the **exact owner's actual deck object**, after authenticated owner search access. It never reads unsearched/K0 owner deck contents. It observed:

| Moment | Owner deck count | Psychic Energy MEE in the owner deck |
| --- | ---: | ---: |
| T2 legitimate search | 45 | **3** |
| T14 legitimate search | 37 | **3** |
| T16 legitimate search | 37 | **3** |

Read-only `ownerCompressorOpportunity` now records owner-hand, owner-Bench, publicly visible discard and Lost Zone Psychic Basic counts. It does not inspect own deck identities, Prize identities, or any opponent hidden zone:

| Moment | Hand Basic Psychic | Active Basic Psychic | Bench Basic Psychic | Discard Basic Psychic | Lost Zone Basic Psychic | Held Compressor | Held Powerglass |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| T16 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| T20 before attachment | 1 | 0 | 0 | 0 | 0 | 1 | 2 |
| T20 after attachment | 0 | 1 | 0 | 0 | 0 | 1 | 2 |
| **T34** | **0** | **1** | **0** | **0** | **0** | **2** | **2** |
| T38 before normal attachment | 1 | 1 | 0 | 0 | 0 | 2 | 2 |
| T38 after normal attachment | 0 | 2 | 0 | 0 | 0 | 2 | 2 |

At T34 `ownDeckCardsRemaining=27`; owner Active is `Galarian Articuno V CRE` with `140` damage and **no Tool**, Item-lock flag false. The archived actual T34 Pass owner hand contains `Battle VIP Pass`, 2 `Dusclops`, `Mysterious Treasure`, `Canceling Cologne`, 2 `Powerglass`, 2 `Battle Compressor`, `Counter Catcher`, `Mewtwo & Mew-GX` and `Klefki`. It contains no Basic Energy.

The candidate's actual non-prompt roots from T16 through T34 are Fog Crystal and Bench Articuno at T16; pass T18; ordinary Basic Psychic attach at T20; bench Latias at T24; Telepathic Psychic Special Energy attach at T28; other turns pass. Its source takes no action in this window that inserts a candidate card into that candidate's Prizes. A legitimate skilled player's T16 deck inspection would know the three Basic printings were not Prized then. No later hidden-Prize redeal is recorded. Since one is publicly attached and all other owner visible zones have zero by T34, the remaining **two** Basic Psychic Energy reside in the owner's deck in this recorded history. These are **conservation of owned card identities plus historical K1 knowledge**, not a peek at the actual T34 deck contents.

## The next native falsification

A real first Battle Compressor could target both deck-resident Basic Psychic Energy under its printed instruction *search your deck for up to three cards and discard them*, followed by an offered `Powerglass SFA` Tool attach to Active Articuno. Under the supplied Advanced Player's Rulebook E-21, Powerglass's end-of-turn Basic attachment can activate even if the player passes without attacking. One Basic could attach at T34 and another at T36 if the Tool remains valid and the owner confirms both native optional choices. Together with the initial attached Psychic, Articuno's printed Psychic + two Colorless `Psyray` could become funded for T38; the historical unmodified first Psyray is T52. The T38 timing is **conditional, unexecuted**, and assumes source pressure, target mobility and effects permit survival.

The remaining deliverable is an actual owner-K1-safe native **Compressor root → own-deck card selection → Powerglass root → end-turn Energy prompt**, preserving prompt acceptances, entire opponent T35/T37 replies, authentic later attack and terminal/censored status. A source-dealt counterfactual is higher value than replaying a mere theoretical turn acceleration. Agent 5 has been notified separately of the potential combo; coordinate before duplicating policy work.

## Limits

- All source-first games here were retrospectively selected and use scripted/underqualified opponent and candidate policies. Exactly 0 games qualify for competitive inference, and no 99.5% claim follows.
- The source-first strict paired comparator passes. The standard workflow's original candidate-first epoch gate fails separately. Do not hide that red workflow status.
- This proof applies to one printed candidate and one historical physical game. It provides no population-level prevalence or win rate.
- No actual Compressor or Powerglass root was executed in the observed T34 turn. No native *T38 Psyray* has yet been observed on this alternative.

