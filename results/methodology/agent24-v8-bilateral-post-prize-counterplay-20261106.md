# V8 two-sided post-Prize response audit: zero funded candidate boards at four source payoffs

**Agent 24 | 6 November 2026 | independent post-hoc archive analysis.** This is a development-only observation, not a paper-legal game or a new policy treatment.

## Question and immutable source

The selected v8 developmental policy has 19 settled source attacks concentrated in three contexts. Were any source Prize-taking episodes followed by actual contender attacks within the frozen root horizon? Did the opponent have an energy-funded visible board immediately after the Prize event?

I downloaded the pre-existing **Agent36/Agent32 v8 Telepath + default-Confirm retrospective treatment** GitHub Actions artifact **13538082892**, from manual run **42287771647**. Artifact name `agent32-issue25-v8-telepath-confirm-default-false-same-eight-native`, downloaded ZIP SHA256 **`36d759b28ae75bb120d94c30a6faa2ae79bd1e03ddb0df902a94418e2ba47882`**, JSON member `treatment/issue25-steward-v8.json`. Report and provenance: `results/methodology/agent36-v8-telepath-confirm-default-false-terminal-20261106.md`. Engine gitlink `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; experiment code commit `a5d3657ac4cdbccd79cced59c133dd6d7d35a6a4`. Eight original registered trial IDs and both actual seats remain unchanged.

For each of the eight `attempts`, I used the recorded `originalSourceSeat` and `candidateSeat`, `actualSourceAttackSettlement.attacks`, `candidateAttackSettlement.attacks`, and entire `publicRootActions` ledger. A **source Prize event** is a genuinely recorded `settledPromptChain===true` source attack whose `prizesAfter[sourceSeat] < prizesBefore[sourceSeat]`. A **post-payoff contender attack** means an `AttackAction` in the same attempt on the contender physical seat at an ordinal strictly greater than that source attack's `completionRootOrdinal`. Zero attached Energy is measured from the contender's `publicBoardAfter` Active and every Bench Pokémon at that first Prize-bearing source attack, without inspecting hands or hidden deck contents.

## Eight-attempt independent ledger census

| Registered original / contender | Settled source attacks | Settled contender attacks | First source Prize attack root → completion | Source Prizes taken during bounded attempt | Contender attacks after first source Prize | Contender public Energy at first source Prize |
|---|---:|---:|---|---:|---:|---|
| Rank 6 / Champion | 2 | 8 Get Lost | 85 → 91 | 1 | 0 | Active 0; Bench 0 |
| Rank 6 / New Moon | 1 | 8 Future Sight | 97 → 103 | 1 | 0 | Active 0; Bench 0 |
| Rank 11 / Champion | 13 Motivate | 0 | 84 → 89 | 2 | 0 | Active 0; Bench 0 |
| Rank 11 / New Moon | 9 Psychic | 2 Future Sight | 40 → 45 | 4 | 0 | Active 0; Bench 0 |
| Rank 1 / Champion | 0 | 4 Eon Blade | None | 0 | not applicable | not applicable |
| Rank 1 / New Moon | 4 Red Knuckles | 9 Future Sight | None | 0 | not applicable | not applicable |
| Rank 3 / Champion | 0 | 0 | None | 0 | not applicable | not applicable |
| Rank 3 / New Moon | 0 | 0 | None | 0 | not applicable | not applicable |

In all **four** source Prize-taking contexts, the contender had **zero attached Energy on every in-play Pokémon** in the immediate post-attack public board snapshot. The contender's next voluntary action after that event was a `PassTurnAction` in three contexts and the first action of subsequent turns was a Pass; for Rank 11 / Champion the next recorded contender response after the Prize was `Fog Crystal`, then `Lillie's Clefairy ex`, then Pass. Across the remainder of those four root tapes, the contender played additional cards in several cases but **never issued another AttackAction**. The two contexts where both parties had attacks before the first source Prize, Rank 6 / Champion and Rank 11 / New Moon, therefore do not establish a post-payoff attack response.

Important nuance: the zero-Energy board is a *snapshot at Prize time*. The contender may gain Energy later, and could conceivably find a legal same-turn attachment, switch, retreat, Ability or alternative attack. These possibilities require its true actor-visible hand, available legal choices, status, locks, payment and prompt state. This archive does not prove the bot missed a legally payable attack, nor does it prove that Pass was optimal. The recorded `Get Lost` and `Future Sight` attack settlements alone do not independently demonstrate valuable Lost Zone or deck-order outcomes.

## Cross-checks and censoring

For all eight rows the published `publicRootLedgerSha256Computed` equals `publicRootLedgerSha256Reported`. Independently counting each side's `AttackAction` roots reproduces each role's `declarations`. Counting `settledPromptChain` matches every reported settled total. In three root-capped rows, the final source declaration was still unresolved at the cap (Rank 6 / New Moon root 125, Rank 11 / New Moon root 125, Rank 1 / New Moon root 125), so I excluded those declarations from settled counts and from Prize evidence.

The Rank 1 / Champion native terminal is candidate-only offense. Its four `Eon Blade` roots occur on candidate turns 13, 17, 21, and 25, with intervening candidate Pass turns, consistent with the printed next-turn attack restriction; no unsupported consecutive-turn Eon Blade violation is asserted. It remains an unqualified mirror-policy liveness witness.

## Decision for the shared-policy release

The archive supplies **four source-Prize episodes with at least one subsequent contender voluntary root**. It supplies **zero post-Prize contender attacks**, and the candidate's immediate energy-free board is a concrete confounder. These are valid development denominators, not proof of adversarial response competence.

For the steward's next **one shared-policy, two-sided complete-game probe**, capture the first contender post-Prize turn's exact owner-visible hand, legal attack and Energy/retreat/search opportunities, available alternate Active candidates, and actual Store-accepted answer/physical payment. Then follow the original source's next consequential decision. A prospective policy probe should distinguish `NO_FUNDED_ATTACK`, `PAYABLE_ATTACK_DECLINED`, `GUST_OR_SEARCH_OPTION`, `ENGINE_REJECTED`, and `PAPER_UNVERIFIED` without treating every Pass as a decision failure.

The existing **Rank 11 / New Moon trial** is a possible bounded continuation canary because it contains nine settled source Psychic attacks, four taken source Prizes and two earlier contender Future Sight attacks; the final source Psychic at root 125 is capped before settlement. It is not a competitive opponent competence witness, and expanding its horizon changes censoring conditions and requires a separately frozen registration. A second plausible verification target is Rank 6 / Champion's one-Prize Volt Cyclone, with eight earlier contender Get Lost attacks. The right selection belongs to the common-policy steward, avoiding another detached rank-specific lane.

**Qualification:** four prize-taking source arms / eight registered contexts, zero counterattacks after source Prize, zero paper- or clock-qualified games, 29/32 authenticated original name/count lists, no selected fixed 60, no verified 99.5% field result.
## Additional source-paired mechanism: the sole Energy holder was Knocked Out

Independent before/after comparison of the **same settled attacks** reveals a sharper mechanism behind the four energy-free post-Prize snapshots. Each contender had nonzero public Energy immediately **before** the first Prize-taking source attack; **all** of it was attached to the contender's then-Active Pokémon. That Pokémon disappeared from play at the settled attack, and the previously Energy-free Bench supplied the new Active. No Energy remained in play. This is a knockout-associated **in-play Energy collapse**, not evidence the contender had already exhausted its Energy before the attack. The public board does not independently prove which physical discard pile received the cards; a future paper custody audit must do so.

| Source / contender | First Prize attack root | Contender Active removed | Attached Energy before → after | Surviving Bench Energy before |
|---|---:|---|---|---:|
| Rank 6 / Champion | 85 | Girafarig LOT | 3 → 0 | 0 |
| Rank 6 / New Moon | 97 | Duskull VIV | 1 → 0 | 0 |
| Rank 11 / Champion | 84 | Dialga-GX UPR | 4 → 0 | 0 |
| Rank 11 / New Moon | 40 | Duskull VIV | 2 → 0 | 0 |

Rank 11 / New Moon has a **second** settled source Prize-taking event, Psychic root 102, which removed an Energy-bearing Mewtwo & Mew-GX (2 Energy before, zero afterward) for **three additional Prizes**. Across the eight attempts, all **five Prize-taking settled source attacks** removed the contender's only in-play Energy holder, while the total four affected attempts each later showed no contender AttackAction after their first Prize.

This identifies a more concrete next policy question: on the first contender turn following the knockout, did the owner possess a paper-payable route to attach Energy, accelerate Energy, switch into a funded attacker, or rebuild its board? Analyze the owner-visible physical hand and true Store-dispatched choices before any intervention. Do not assume the earlier Energy concentration was inherently a mistake: its optimality depends on resources, matchup tempo, bench access and the opponent's credible next KO.

### Refueling evidence after the first Prize event

The four contenders were **energy-free immediately after the first knockout**, but this did not remain true in every later public snapshot. In Rank 11 / Champion, later source Motivate roots 116 and 123 show the contender with **one** Energy attached before and after the source attack. In Rank 11 / New Moon, later source Psychic root 94 shows **one** contender Energy in play, and root 102 shows **two** Energy attached before the attack and **zero** afterward, as its previously Active Mewtwo & Mew-GX gives way to Trevenant & Dusknoir-GX and the source takes three additional Prizes. The contender's actual public roots include a Telepathic Psychic Energy play at root 87 and a Psychic Energy play at root 98, but the archive lacks a verified per-root physical Energy custody join for attributing those exact attachments.

Thus an initial zero-Energy snapshot is a strong **immediate** constraint, while the more informative tempo question is whether refueling can produce a safe attack **before the source's next effective knockout**. The recorded Rank 11 / New Moon sequence contains a second observed energy collapse. No contender AttackAction follows its first source Prize, despite the intervening Energy buildup. This finding is still bounded by the root cap, owner-policy competency and independent paper-fidelity gaps.

## The actual first contender-turn actions are already in the public attack packet

The `actualSourceAttackSettlement.attacks[].nextSourceTurnActions` field, despite its legacy `nextSource` name, identifies the **other physical seat's immediately following turn** after each original-source attack; `nextSourceSameEpochProven=true` in all five Prize-taking cases. It contains a bounded actual Store-root action sequence, including prompt actions. Its recorded `sourceTurnActionsTruncated=false` for all five of these next-turn traces, so the following direct plays and Passes are complete for those turns within the native root cap.

| Source / contender | Prize attack root | Contender's next full recorded voluntary turn |
|---|---:|---|
| Rank 6 / Champion | 85 | Pass |
| Rank 6 / New Moon | 97 | Pass |
| Rank 11 / Champion | 84 | Play Fog Crystal; resolve the search prompts; play Lillie's Clefairy ex; Pass |
| Rank 11 / New Moon | 40 | Pass |
| Rank 11 / New Moon (second Prize event) | 102 | Play Mewtwo & Mew-GX; Pass |

Every one of these five observed turns ends in Pass and **none contains a contender AttackAction**. Crucially, the Rank 11 / Champion and Rank 11 / New Moon second-Prize replies each contain a meaningful non-Pass card play. This disproves the too-simple explanation that the contender bot literally did nothing after every source knockout. The exact legal Energy/search alternative frontier remains unproven: a Fog Crystal search or Basic Pokémon Bench play need not produce enough Energy for a paid attack that turn, and the published compact archive omits the `decisionHandBefore` private-owner snapshot available to the headless runner.

The shared source-independent runner already computes `candidateRepliesAfterSourceAttacks` from the actual full `game.decisionTrace`, including the owner hand immediately before a Pass, `publicBoardBeforePass`, the printed-Basic-Energy check, and an opt-in bounded post-Pass cloned native attack-announcement probe. Those fields are discarded by the compact `issue25-steward-v8.json` reporting path. **An archival projection of this existing data**, correlated to the first physical source Prize event, is a smaller and more reproducible next experiment than a new bot strategy or new workflow. Its native canPlay evidence must still be independently audited against paper and printed target/cost rules.
