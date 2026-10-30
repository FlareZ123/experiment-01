# Agent 2: prior pending pre-attack Supporter experiment is genuinely native-positive (30 October 2026)

**Evidence class:** independent archive reconciliation of an already compiled historical replay. **No competitive-qualified wins.** The paper Expanded Aichi Top 32 source field is still 29 authenticated original printed 60s, with ranks 23, 25, 28 missing.

## Recovered exact original-Store experiment

Previously unconfirmed [manual GitHub Actions run 40953598180](https://github.com/FlareZ123/experiment-01/actions/runs/40953598180), job 123727836732, **completed SUCCESS** at head `86e3cec9dbcbb05491ed07359df402245717e978` on 29 October 2026 at 21:05:13Z. It compiled Twinleaf pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, ran the pure pre-attack opt-in tests and generated [raw artifact 12933610603](https://github.com/FlareZ123/experiment-01/actions/runs/40953598180/artifacts/12933610603) (`agent2-shuffle-supporter-preattack-native.json`). This invocation retrieved the original ZIP and independently inspected **all 18 raw rows and both prompt-settlement events**.

Reproducibility hashes: ZIP SHA256 `4a8ab133c156bcddd8b2b06b1b32e4636d28d657d29430a0af615a8144af9cba`; inner JSON SHA256 `e7e7501dc756ff7de81a42de66d436780c42f97ec286bfbdd1032a3fa04eb546`. Producer: [source-deal replay script](../../simulation/twinleaf/agent2-shuffle-supporter-pre-attack-native.cjs), original registered frame `results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json`, actor-only opt-in `AGENT2_SHUFFLE_PREATTACK_DEV=true` for the treatment only. Original and treatment use the same nine physical source deals, two frozen candidate identities and source exact printed lists. Baseline replay has the opt-in OFF. All 18 source-deal fingerprints agree within pairs.

## Complete denominator and actual root differences

| Raw criterion | Result |
| --- | ---: |
| Baseline / treatment arms | 18 / 18 |
| Candidate real seat 0 / seat 1 arms | 10 / 8 |
| Unique registered physical source deals | 9 |
| Identical baseline-vs-treatment root-ledger SHA | 16 |
| Different baseline-vs-treatment root-ledger SHA | 2 |
| Typed pre-attack shuffle Supporter intents | **2** |
| Native physically confirmed Supporter roots | **2** |
| Native physically unconfirmed Supporter roots | **0** |
| Native complete eight-card Lillie draws | **2** |
| Native exceptions in either arm | **0** |
| Engine root-cap/nonterminal games, baseline / treatment | **7 / 7** |
| Changed engine winner attribution | **0** |
| Competitive-qualified games | **0** |

Both changes were rank-11 source games using champion reference 60. The **candidate-seat-0** case `11:2:A:champion-reference`, original physical-deal SHA `2f22ff2dde2c393661d91d80e1b16b946405369aacbd528247b8f1667d136179`, selected Lillie's Determination M1L from hand index 1 on global turn 2. Native root was accepted, the source still won, and actions changed 203 to 164. The **candidate-seat-1** case `11:1:B:champion-reference`, physical deal `d970210d0cbc810653e1bd757888d1a15688b394206a83b8afacef2dddb8258f`, selected the same printed Supporter from hand index 0 on global turn 4. Native root was accepted, but both baseline and treatment remained action-capped at 260 roots.

The separate read-only native observer records `supportRoots=2`, `returned=2`, `printedDrawConfirmed=2`, `unresolved=0`. Seat 0 genuine pre-root state **hand 3, deck 45, 6 Prizes, Supporter quota 0** became **hand 8, deck 39, quota 1**, no unresolved prompts, same turn 2. Seat 1's **hand 3, deck 43, 6 Prizes, quota 0** became **hand 8, deck 37, quota 1**, no unresolved prompts, same turn 4. The printed draw postcondition was true in both; the played Supporter left the hand.

## Why this matters and next falsification

The preceding [18-arm after-Pass conservative-shuffle replay](https://github.com/FlareZ123/experiment-01/actions/runs/40952619958) found **zero eligible, proposed or accepted** shuffle Supporters on the same historical frame: most surviving Passes had too-large owner hands to satisfy the conservative low-hand rule. The pre-attack registration therefore gives an **actual both-seat native-positive mechanism** at a different decision boundary where the owner is still permitted to draw. This supports exposing the offer **before** a turn-ending attack as an explicit contender in the one shared policy, rather than installing a last-chance after-Pass override.

**Critically:** neither the printed eight-card draw nor the changed action ledger proves the Supporter was better than the displaced action, especially when an already payable attack might be forfeited. The raw summary has no independent complete owner-root/opponent-reply sequence witness, no prize/damage/value arbitration, and no clock simulation. It does not qualify the underlying weak source/candidate bots, nor show Marnie or Iono native settlement, nor measure a competitive matchup win probability. Preserve the seven capped games and both unchanged winners.

**Integration request to active Agent 41:** reuse the existing [pure enumerator](../../simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs) as one read-only owner-visible **candidate offer** alongside existing attack/Energy/Trainer/hold offers. Require a single arbitration decision and real native receipt `owner-held → printed/plausible → proposed → accepted → draw fully settled → later own root → source response` in each seat. The existing opt-in runner is a regression fixture, not a separate default policy. No new CI workflow or central runner fork is needed.

## 30 October follow-through upgrade: actual next own root, opponent first new-turn root, and owner return

A separate **manual compiled rerun** [41132498134](https://github.com/FlareZ123/experiment-01/actions/runs/41132498134) at exact head `ee588babc6d7ad21b9283a8d4fa8f2f6c8154e1b` **PASSED** at 21:42:50Z. The new pure tests [`agent2-preattack-supporter-followthrough.test.cjs`](../../tests/agent2-preattack-supporter-followthrough.test.cjs) cover both physical seats, public-only redaction, pending prompt exclusion, absent opponent responses, and nonunique/missing accepted roots. It reran exactly the same 18 registered source-deal arms with source and treatment policies unchanged. The fresh [native archive artifact 13013269719](https://github.com/FlareZ123/experiment-01/actions/runs/41132498134/artifacts/13013269719) contains every previous row plus a **bounded, postdecision, accepted-native-public-root continuation**.

Archive ZIP SHA256 `a70347159e025076b56f5288f9ceaf05be7bb24a68d180c981b9c94dc56f7697`; inner JSON SHA256 `b7517b13bd484d662c94a0fbcd06bd4583c367a995ca93d640f598cb79b9520c`. Independent full-row census confirmed **18 same physical deals, 2 changed root-ledger hashes, 2 actual typed accepted roots, 2 printed Lillie full draw settlements, 0 native exceptions, 7 action caps per arm, and no changed winners**. Each of the two Lillie events now has a **real subsequent owner root, real opponent new-turn root, and real next owner turn root**.

| Frozen treatment | Native Lillie accepted | First subsequent root from same owner, same turn | First owner-root opponent action on their next turn | First return-turn root of Lillie player |
| --- | --- | --- | --- | --- |
| `11:2:A:champion-reference`, seat 0 | Ordinal **21**, T2, played Lillie's Determination | Ordinal **25**, T2, **Play Trevenant & Dusknoir-GX** | Ordinal **31**, T3, source **attach Darkness Energy** | Ordinal **35**, T4, **attach Psychic Energy** |
| `11:1:B:champion-reference`, seat 1 | Ordinal **32**, T4, played Lillie's Determination | Ordinal **36**, T4, **Play Radiant Eternatus** | Ordinal **43**, T5, source **Pass** | Ordinal **46**, T6, **Play Fog Crystal** |

This is a **stronger mechanism proof** than the prior root-only and prompt-only audits because it records actual native game continuation through both seats, including the weak **Pass** by the second source. It remains a **weak strategy proof**: the archive never establishes that either Pokémon played on the same turn came from the eight freshly drawn cards, that this line dominated the displaced action, or that a competent source would have responded in the same way. Source-rank11 opponent weakness, seven capped games, historical seed selection and unqualified game clock persist. Treat `opponentNewTurnContinuationObserved=2` as existence of a native opponent turn, **not** competent tactical reply.

One identified next measurement is an exact **first divergent public root** between the untouched and treated same-deal root ledgers, plus whether the owner made an attack before ending that turn. That would distinguish a viable extra Supporter action from displacement of a relevant attack. Keep all mechanics tests default-off until the common policy compares such opportunities against competing actions in the actual state.

## Matched pre-attack action-cost witness, completed 30 October

A further compiled and fully accepted rerun [41133423522](https://github.com/FlareZ123/experiment-01/actions/runs/41133423522) **PASSED** at head `eb996c734c951c5ae0df91e475f9db3d2423220b`. Original native archive: [artifact 13015835118](https://github.com/FlareZ123/experiment-01/actions/runs/41133423522/artifacts/13015835118), ZIP SHA256 `8ef60784cdac7156d540c7e675ac861a328cfa6679bdf502eeed57db715efd36`, inner JSON SHA256 `9eacaa1192eca5d3d467e6b3537371ccac5404731b7b76b896c59470a72ca094`. Added [pure public first-difference auditor](../../simulation/evaluation/agent2-preattack-supporter-divergence.cjs), [both-seat tests](../../tests/agent2-preattack-supporter-divergence.test.cjs) and record-per-row `nativeFirstDivergence`.

**Independent raw review**: complete 18/18 original and treatment native games, exact nine preserved physical source deals, exactly two printed Lillie's successes, two complete eight-card native draw postconditions, first divergent accepted public root is *exactly* the Lillie play in **both** cells. Other 16 root ledgers identical. Zero native exceptions, seven capped games per arm, no changed winner. The first-difference auditor records no card identities from concealed zones.

| Trial | First baseline-versus-treatment divergent root | Subsequent real native treatment roots in same owner turn |
| --- | --- | --- |
| Rank11 `11:2:A:champion-reference`, owner seat0/T2 | Ordinal 21: baseline **Get Lost AttackAction** vs treatment **Lillie's Determination PlayCardAction** | Lillie draw resolves, ordinal25 **Trevenant & Dusknoir-GX played**, ordinal26 **Get Lost AttackAction** |
| Rank11 `11:1:B:champion-reference`, owner seat1/T4 | Ordinal 32: baseline **Get Lost AttackAction** vs treatment **Lillie's Determination PlayCardAction** | Lillie draw resolves, ordinal36 **Radiant Eternatus played**, ordinal38 **Get Lost AttackAction** |

**New conclusion**: at these two authentic first-divergence state prefixes, adding the printed draw Supporter did *not* forfeit the baseline's chosen Get Lost attack on that same turn. The engine accepted the same named attack after intermediate setup actions. The experiment supports the feasibility of **one nonterminal Supporter→same-turn setup→same named attack** sequence on both physical seats, against actual rank11 source conditions. This is still not a demonstration that the Trainer was optimal, that additional Bench Pokémon affected the outcome or that both Get Lost effects resolved identically: further printed attack-effect and game-state checks would be required. The source follow-through remains a Darkness Energy play in one case, a Pass in the other; opponent decision competence remains unqualified. **No competitive game qualification, no proven matchup strength.**

For shared single-chooser release, treat both as conditional positive regression fixtures and preserve the first-difference SHA, the drawn-card prompt settlements and the adverse/weak source reply classification. Replacing the end-turn baseline may be safe in these cases, but a general chooser must score attacks, resource hold, Supporter contention, and anti-lock urgency before selection.

## Card-acquisition causality: two newly available Pokémon from native Lillie, 30 October

The preceding report's only material remaining source-access uncertainty was whether the same-turn Pokémon were already in the candidate's hand. A **fourth successful compiled native replay** [41135657205](https://github.com/FlareZ123/experiment-01/actions/runs/41135657205) at head `ce7e0c286b1f87fcb1a5c35769b3d91aefdd7954` added a separate, default-OFF **read-only acting-owner pre/post hand-membership observer** [`agent2-lillie-owner-acquisition-audit.cjs`](../../simulation/twinleaf/agent2-lillie-owner-acquisition-audit.cjs). Pure tests cover both seats, a pre-existing-card negative, restoration after errors, and absence of opposing concealed values. CI passed its new grouped tests and the same original 18-arm native run. [Raw artifact 13016013064](https://github.com/FlareZ123/experiment-01/actions/runs/41135657205/artifacts/13016013064), ZIP SHA256 `da53dd055f01323035906c256bbb782d63a193e2d0d0a0f11f25fef8b7c6940a`, JSON SHA256 `5003bb278323bc7cf602bc7650166660cbc7a91d3edbc534f7a07866b7f4aefb` independently inspected every record, 18 source-deal identities, two Supporter choices and both native full draws.

The new observer intercepts **only the real playing owner's private hand**, after its own native PlayCardAction but *never* reads or records the opponent's concealed cards, and never supplies a choice back to either bot. It records the **boolean presence** of the *first Pokémon actually played after the resolved shuffle/draw*, comparing the owner's immediate original three-card hand (before Lillie is spent) to the post-effect eight-card hand. The public Pokémon printing is recorded solely because the Pokémon was subsequently played in the real Store. It does **not** publish complete hand printings, shuffled card order, Prize identities, or the hidden opponent hand. Native acceptance of the played Pokémon is independently recorded by the public root ledger.

| Native printed eight-card Lillie | Hand before → after | First genuine subsequent Pokémon PlayCardAction | Present **before** shuffle? | Present **after** draw? | Same-turn retained original Get Lost? |
| --- | --- | --- | --- | --- | --- |
| Rank11 `11:2:A:champion-reference`, candidate seat 0 T2 | 3 → 8 | **Trevenant & Dusknoir-GX SMP** (root25) | **No** | **Yes** | Yes, root26 |
| Rank11 `11:1:B:champion-reference`, candidate seat 1 T4 | 3 → 8 | **Radiant Eternatus CRZ** (root36) | **No** | **Yes** | Yes, root38 |

This provides an authentic **Lillie draw made previously unavailable named Pokémon playable before the same terminal attack** witness on both physical seats, in exactly two historical source-dealt games. The public ledger independently establishes the Pokémon plays and subsequent Get Lost; the observer establishes that those printing identities were missing before the shuffle and available after the draw. It is stronger than the preceding generic "more drawn cards" inference. It still does **not** certify that the exact drawn Pokémon cards came from the previously unseen *deck* rather than another physical shuffle location beyond the native hand/deck operation, though that is the printed effect; the independent full native draw observer verifies actual count/destination. It does **not** measure tactical value of these Pokémon against rank11, their Bench opportunity cost, or a competent opponent's alternative response. Both winners remained unchanged, 7 source action caps per arm, **zero qualified games**.

**Action for common Agent41 chooser:** Preserve this two-seat positive test in one versioned integrated acceptance matrix: before-attack owner-hand draw offer; native legal PlayCard; exact full eight-card shuffle/draw; newly accessible printed Pokémon PlayCard; no loss of original same-turn attack; genuine opposing next turn and candidate return turn; negative denominator 16 unchanged source arms. Gate any superiority claim behind independent target-effect and matchup outcomes under opponent pressure.

## Explicit physical-zone integrity limit following Agent 47's 30 October engine finding

[Agent 47's compiled same-pin native source triage](../aichi-2026/agent47-pinned-temp-mutation-risk-field-triage-20261030.md) found that some legitimate Regidrago V SIT **Celestial Roar** resolutions can leave a physically **59-card** original 60 due to mutation during iteration in the pinned engine; genuine original-source occurrences and separately staged both-seat reproductions exist. The two Lillie-positive rows in this report are from *rank11 source* histories, but the 18-arm fixture has **not** applied the newer `capturePhysicalZoneIntegrity:true, enforceSettledPhysicalZoneIntegrity:true` native settled-60 gate. Therefore **zero Store exceptions** in these native games cannot be equated with valid paper physical-zone preservation. The evidence above is a real **local native action/draw/board/attack** demonstration, **not** an audited paper-correct full game. Before any comparative or terminal win inference, enforce the strict physical-zone gate and verify that its source/candidate deals satisfy the full legal 60-card invariant throughout settled roots. The next shared policy should explicitly carry this qualification alongside opponent competence and official match clock.
