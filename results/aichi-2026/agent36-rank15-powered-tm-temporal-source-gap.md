# Rank-15 Bunnelby powered-TM opportunity: the missing Oddish target precedes Bench crowding

**Agent 36, 19 October 2026.** Original Aichi rank-15 **Ryotaro Nozawa, Lopunny Vileplume** printed 60 against unchanged New Moon Lockbreaker v1 English-mechanics proxy 60. **Mechanical and decision-policy diagnostic only; zero competitive games.**

## Reproduction and exact provenance

- Pinned Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Runner: [matched original-source Bunnelby policy pair](../../simulation/twinleaf/newmoon-rank15-bunnelby-policy-pair.cjs), using actual `Store.dispatch` observer [source](../../simulation/twinleaf/newmoon-rank15-source-duallock-census.cjs).
- Frozen 4 repeat seeds × 2 candidate physical seats; original printed 60s, source first-player order and initial physical cards matched within every policy pair; observed only root postdispatch positions while **both players retained six Prizes**.
- Manual compiled [GitHub Actions run 39284019439](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439), **success**, runner revision `f72bf398d61afb67dde20020b8adfd961d4e36b8`. Full original two-policy game JSON: [artifact 12201859174](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439/artifacts/12201859174), zip SHA-256 `b289c481aa64a801ef4a78b94080f48bcff605a6b8eaf25e7435fd4710a20f30`. Separately derived [root-readiness artifact 12201694445](https://github.com/FlareZ123/experiment-01/actions/runs/39284019439/artifacts/12201694445), zip SHA-256 `d12d519d2dd5fc3d61470a4510783654858f2273f9687a71df9dfe9a5ba13eb0`. Four audit tests and compiled source tests passed.
- Audit script [here](../../scripts/aichi-rank15-bunnelby-readiness-audit.cjs), source initial-Prize gate [here](../../simulation/twinleaf/rank15-prize-prereq.cjs). Original paired run [39247283776](https://github.com/FlareZ123/experiment-01/actions/runs/39247283776) did not yet record physical readiness, so its zero attack count alone was not sufficient to distinguish readiness versus choice.

## Eight same-deal paired source-policy arms

| At least one root snapshot in a deal | Generic bot | Bunnelby Evolution K0/K1 policy |
| --- | ---: | ---: |
| Initial Vileplume Prize-chain prerequisites eligible | 5 | 5 |
| Source Bunnelby Active | 3 | 2 |
| Bunnelby Active with TM: Evolution attached | 1 | 1 |
| Above, also with an Energy attached | 1 | 1 |
| Powered TM plus at least one Benched evolution target | **0** | **0** |
| Two source Vileplume stage-line positions | 2 | 1 |
| Full source Bench with fewer than two stage-line positions | 8 | 8 |
| Native Store `Evolution` declarations | **0** | **0** |

Each count is an exposure indicator over **eight historical physical games per arm**, potentially at different turns. These counts are not a co-occurrence matrix and cannot be interpreted as an estimated probability of winning or establishing a competitive lock. The stronger Source Bunnelby policy did **not** improve this recorded readiness objective in those eight original games.

## Important temporal and causal correction

The **only powered Active Bunnelby + TM snapshot** in both arms occurred in **repeat 0, candidate physical seat A, source seat B**, immediately after actual root action **ordinal 125 at global turn 16**, with Source B currently to act:

| Source zone | Observed printed cards |
| --- | --- |
| Active | **Bunnelby PRC**, `Technical Machine: Evolution PAR`, `Grass Energy MEE` |
| Bench | `Budew ASC`; `Eldegoss V RCL`; **3 empty slots** |
| Vileplume evolution lines in play | **0** |

There was no `Oddish UNB` or `Gloom UNB` on that source board. The stage-target count was zero, so reaching a mechanically paid Tool state alone did not establish the desired ALS. The source first hit **full Bench with fewer than two Vileplume lines** only at **global turn 36, action ordinal 246**, with one Oddish on the Bench. This is twenty global turns **after** the earlier missed powered-TM opportunity. Therefore **Bench crowding did not cause that particular zero-target state**; the source had ample Bench capacity at turn 16.

Other paired games *did* show early full Bench. In the generic arm, first full-Bench-under-two-line turn by registered row order was: `36, 1, 25, 20, 17, 9, 31, 6`. Those observations keep Bench reservation relevant as a separate testable hypothesis, but cannot retrospectively explain the turn-16 missing Oddish. The source-game policies repeatedly extended far into untimed turns without taking Prizes, which itself warns against competitive-strength inference.

## Root owner-hand observation: Poffin + Tag Call still held

After adding a **read-only actor-owned-hand snapshot to the first powered-TM genuine root event**, the same eight fixed physical deals were recompiled in **[CI 39332235844](https://github.com/FlareZ123/experiment-01/actions/runs/39332235844)**. The workflow and unit tests **passed**, preserving unchanged candidate/opponent 60s, seed schedule and the original paid-TM source snapshot. [Full paired JSON artifact 12224289513](https://github.com/FlareZ123/experiment-01/actions/runs/39332235844/artifacts/12224289513) was independently downloaded and its ZIP SHA-256 verified as `8f717cac3d29f4d5dd4abcebc7a17cbfbbcdc7763f8de2b14befbd027a1f2d22`.

At global **turn 16 / source root ordinal 125**, immediately after the real Tool-attachment `PlayCardAction`, the rank-15 source **held exactly**:

- `Buddy-Buddy Poffin TEF`
- `Tag Call CEC`

This owner-known hand is identical in the generic and enhanced source-policy arms on the same physical original deal. The source's Active remains Bunnelby with a paid Tool attack, and three Bench slots are open. The Poffin is a strong **action-falsification candidate**, because the physical source has two Oddish UNB in its originally registered 60. But initial unprized Oddish does not establish that either was still in the source deck at turn 16, nor does a held Item establish permission to play it in the face of possible attack- or Ability-based Item locks. **A subsequent targeted native-source fork has now proved the Poffin is playable at this exact owned-hand state**, and produced a real Evolution attack declaration. See the compiled fork result below. A future live Store test must verify the actual Item play, owner-deck choice prompt, chosen Oddish, resulting Bench state and Tool-attack eligibility; if the action is blocked, preserve the exact reason.

This identifies a specific possible *setup-action omission*, rather than a need for yet another broader eight-game comparison. It also precludes explaining the sole currently observed powered-TM target miss solely through lack of a search Item **in hand**.

## Decision gate and next research

1. Establish what **rank-15-own-hand and public Stadium** resources were available at the first genuine paid Tool state before proposing an action. An **owner-hand-only**, read-only source observer has now been committed to the existing runner; this code addition requires a *new compiled output* before any result about actual held Poffin, Tag Call, Artazon or search options is claimed. No hidden deck or Prize identities are exposed to the acting policy.
2. Check a **live owner-legal** Oddish-to-Bench action sequence (held Oddish or Poffin, an actually usable Stadium/search chain, capacity, and other action/resource costs) before the Tool attack. Test real prompts and source board changes, including no-opportunity deals. This is about policy competence and temporal opportunity, not a proposed decklist swap.
3. The registered **historical eight-anchor Bench-reservation policy** comparison has now completed successfully in pinned CI, and its narrow source evidence is recorded below. The source printed 60 and original physical deals remain unchanged.

**Qualification boundary:** the opposing source and candidate both use unqualified automated decisions, event flags do not certify all attack legality/effects, and the same historical seeds have been repeatedly studied. No independent competitive matchup outcomes, complete Top-32 performance claim or 99.5% win-rate certification follow from this report. Top-32 exact list coverage remains **29/32**.


## Native Poffin-before-attack fork: a real lost Evolution declaration

The pre-registered original-source `repeat0 / candidate seatA / source seatB` paid-TM witness was used for an explicitly **retrospective one-deal mechanical intervention**. The source's *same exact 60*, challenger *same exact 60*, signed original physical first-player order, original seed **3050400820**, six-Prize arrangement, pinned engine `a9905a76...`, and all baseline hook flags were retained. The only change was to offer **one actor-owned, native-validated** `PlayCardAction` for its held **Buddy-Buddy Poffin TEF** when Active Bunnelby already carried TM: Evolution and Energy, a direct evolution target was missing, and it still had Bench room. Remaining prompt choices were handled by the existing generic source bot.

**[Compiled manual CI 39333636856](https://github.com/FlareZ123/experiment-01/actions/runs/39333636856) succeeded**, including the new owner-hand/no-hidden-zone unit tests and real Store replay. [Original and Poffin-fork root JSON artifact 12225223832](https://github.com/FlareZ123/experiment-01/actions/runs/39333636856/artifacts/12225223832) was independently downloaded; ZIP SHA-256 **`68024fa1c687ed621ed8dd82c92e87e04459c40f9dba2d575d91abcb3e8c1612`**. Source runner [here](../../simulation/twinleaf/rank15-paid-tm-poffin-original-root.cjs), owner-decision hook [here](../../simulation/twinleaf/rank15-paid-tm-poffin-source-policy.cjs). Both root game logs were 260 actions long, kept the true candidate-first identity, unchanged input 60s, exact matching prepolicy zone and Prize digests, and physically zero of each required Stage category initially Prized.

| Actual root event on global turn 16 | Historical bot | One Poffin option |
| --- | --- | --- |
| Previously paid Bunnelby/TM/Energy position | Yes | Yes |
| Native `isValidAction` for Poffin | Not evaluated | **True** |
| Genuine root Poffin `PlayCardAction` | **0** over whole original game | **1**, root124 |
| Next native source actions | Tag Call at root124; Guzma & Hala at root129; eventually Pass | Actual owner-deck `ChooseCardsPrompt` root125, shuffle root126; Tag Call root127; Guzma & Hala root132; Artazon root137 |
| Native printed `Evolution` `AttackAction` | **0** | **1**, root138 |
| Native `Evolution` search prompts | None | `ChoosePokemonPrompt` root139, `ChooseCardsPrompt` root140, shuffle root141, confirmation root143 |
| Any source Oddish on Bench before either player takes a Prize | First recorded at global turn36, root246 | **Never observed** |

The Poffin alternative's single real Evolution declaration and subsequent native prompts establish a previously missed *action-sequencing capability*. The initial fork established the native declaration and search prompts, and a subsequent genuine-root public-Board witness **confirmed the actual Stage1 evolution destination**. It still does **not** establish a double Evolution attack, dual-Vileplume lock, full opponent response or competitive game result. Neither arm's generic bot is competitively qualified, and the one physical seed was retrospectively selected precisely because this bottleneck was known. Untimed terminal outcomes are excluded from the finding.

**Immediate experimental question:** identify which printed Basic(s) the real Poffin prompt put on the Bench and which evolution target the live TM prompt chose. The observer recorded no `Oddish UNB` on Bench in the Poffin arm, so a demonstrated Evolution attack has not solved the source's intended **two Vileplume** line. Capture selected live prompt responses and public evolution before formulating an Oddish-target resolver; actor deck inspection is allowed only at an actual owner-deck search prompt. This case provides a powerful **positive regression** for a shared delayed-setup action policy: mandatory verified native Poffin and Evolution declaration under one exact source witness, while retaining correct no-opportunity/locked states elsewhere.

### Exactly which Basic and evolution the native bot chose

A new reusable **root-only, owner-prompt and public-board observer** [source](../../simulation/twinleaf/owner-root-choice-window.cjs) was added without changing game decisions. [Compiled manual CI 39334640037](https://github.com/FlareZ123/experiment-01/actions/runs/39334640037) passed its observer/owner-policy tests and the identical Poffin original-deal fork. [Archived root-choice artifact 12225707719](https://github.com/FlareZ123/experiment-01/actions/runs/39334640037/artifacts/12225707719), ZIP SHA-256 **`a4cc4b18704b26da4ee2066278f05aee332c52ca6979a7130780f01e93609a54`**, independently downloaded and verified.

At the **actual owned-deck Poffin ChooseCardsPrompt**, the pinned generic source policy chose exactly **`Budew ASC` + `Buneary M2`**. The next completed real root action placed both printed Basics on the source Bench, leaving one vacancy:

`Budew ASC, Eldegoss V RCL, Budew ASC, Buneary M2, EMPTY`

At the native **TM: Evolution** attack, `ChoosePokemonPrompt` targeted **`Buneary M2`**, the actual owner-deck `ChooseCardsPrompt` selected **`Mega Lopunny ex M2`**, and the postdispatch public board changed from Buneary to **Mega Lopunny ex**. This is a **verified real Stage1 evolution effect**, while the source's intended Oddish-to-Gloom-to-Vileplume lock remained absent. The engine `M2` printing is a mapped proxy for the original rank-15 published PFL Mega Lopunny ex printing; these are unchanged game-effect simulations rather than physical printing substitutions in a legal tournament deck.

At the owner's Poffin deck search, the real action had already entered an owner-visible K1 search event, so the next forensic check can legitimately count physical `Oddish UNB` **in that actual own-deck search collection**. Without that observation we cannot determine whether choosing Budew and Buneary was an avoidable misprioritization, a necessary adaptation to inaccessible Oddish, or a reasonable alternative goal in the late-game matchup. For the real-deal regression itself, the cause of missing Oddish on Bench is now concrete: **the actual Poffin prompt selected other Basic Pokémon**.

## Completed Bench-reservation counterfactual (same original deals)

An independent manual pinned [workflow 39331437715](https://github.com/FlareZ123/experiment-01/actions/runs/39331437715), head `95eb26d90c14c145ccf26a18b10bb52075bf51e6`, **succeeded** with `rank15_bench_reservation:true`. The eight-anchor source runner [here](../../simulation/twinleaf/rank15-vileplume-bench-reserved-source.cjs) executed **8/8** original physical deals, independently verified all eight original prepolicy zone digests and start orders, encountered **zero engine/validation errors**, and preserved every invalid-Prize deal. No game winner is used. Full [JSON artifact 12223529194](https://github.com/FlareZ123/experiment-01/actions/runs/39331437715/artifacts/12223529194), ZIP SHA-256 `78fcbf5155a0b6a41bb0134fc5b1f6e172c9de44cd527c69641a81720dcd06e5`.

The enhanced Bunnelby + owner-visible Bench-reservation arm showed **AOR in 2/8, BUS in 1/8, both together in 0/8**, two Vileplume-chain positions in **1/8**, a first full source Bench with fewer than two lines in **8/8**, and **zero** native `Evolution` declarations in every trial. The earlier matched enhanced Bunnelby arm had AOR **2/8**, BUS **0/8**, both **0/8**, and two Stage lines **1/8**. The only recorded reservation intervention candidate is **repeat 2 / candidate seat B, global turn 9**, deferring Buneary with one Stage line and one free Bench slot; its subsequent BUS at turn 17 arose in a trial where initial dual-stage Prize prerequisites were **ineligible**. The intervention event collector may include speculative evaluations; without a root-action comparison this does not prove that the deferral actually altered the real Store policy. It certainly is no proof of competitive dual-lock improvement.

**Observed disposition:** this reservation-only tactic does not establish a natural double Vileplume or TM: Evolution source line on the eight fixed historical deals. Shift work to **owner-visible acquisition/play of Oddish before a powered TM state** and verify at the live root. The original lone paid Tool state still had three empty Bench positions, so the new null result is compatible with that earlier diagnosis. Do not increase the number of generic-bot games on this tactic alone.
