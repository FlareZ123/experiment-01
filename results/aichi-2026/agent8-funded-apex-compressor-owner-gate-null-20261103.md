# Original rank-13 Regidrago: live owner-root Compressor gate attribution

**Agent 8 | 3 November 2026 | Retrospective, developmental, zero competitively qualified games**

## Research question

The preregistered original rank-13 Regidrago vs original rank-1 Shadow Rider six-arm Battle Compressor development study had no selected Compressor, even though its selected historical seed was annotated as a funded VSTAR with a held Compressor and missing Dragon payload. Was the missing action caused by canonical policy priority, Item lock, an unfunded Active attacker, or the different prerequisite flags failing on different owner turns?

This audit adds **read-only owner-information-safe independent necessary-gate evidence** to the unchanged default-off after-Pass intervention. The same two already-inspected physical setups are replayed as control/treatment/repeated-control (six native attempts, **two** independent deal groups). These historical selected deals cannot establish prospective incidence or win performance.

## Method and reproducibility

- Immutable original source decks: rank 13 Hiromu Sasaki, rank 1 Shadow Rider; original printed 60-card lists from [authenticated field](full-decklists.json).
- Registration: [frozen six-arm manifest](registrations/agent8-funded-apex-compressor-retrospective-20261103.json), seeds **3588534981** (source seat 1) and **1571178812** (source seat 0), max 160 actions per attempt.
- Engine: pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; original 60s, identical correction hooks and policy except the registered after-Pass source intervention.
- New instrument: [owner-root classifier](../../simulation/twinleaf/agent8-funded-apex-compressor-owner-bridge.cjs) at root events backed by the live Store, excluding speculative cloned Stores; measures held Compressor, nonempty deck, absence of public Item lock, Active Regidrago VSTAR, public Apex colored-Energy feasibility, and *absence* of any copyable public Dragon discard. A sequential first-failure count and **independent per-gate positive counts** are both preserved.
- Real owner-hand and public board only; there is no inspection of hidden own-deck identities until an actual legal owner deck prompt, and this study never reached such a prompt.
- Two new regression assertions in the existing [pure diagnostic test](../../tests/agent8-funded-apex-compressor-owner-bridge.test.cjs) and [Store identity test](../../tests/agent8-funded-apex-compressor-store-identity.test.cjs). Manual pure-only CI [41706961710](https://github.com/FlareZ123/experiment-01/actions/runs/41706961710) succeeded.
- Complete native CI [41707096663](https://github.com/FlareZ123/experiment-01/actions/runs/41707096663) succeeded on source head `b597da56d65c0fc4bb09f80e8bf550fe2b495d51`; native archive artifact **13267320151**, uploaded ZIP SHA256 **`2be15cfbec868dcc900273c8791043c61ca3004d6250d5bc349af0b01a9f2e91`**. This archive retains full six-attempt native JSON. No new default-on gameplay feature was added.

## Live owner-root evidence

Each row is one *physical deal*, using the treatment's actual live owner-root observations. Several roots can occur in the same game, so these counts are **repeated within-game decisions**, never independent games.

| Root metric | Seed 3588534981, source seat 1 | Seed 1571178812, source seat 0 |
| --- | ---: | ---: |
| Authenticated live owner roots examined | **23** | **12** |
| Held Battle Compressor | 10 | 12 |
| Deck nonempty | 23 | 12 |
| Public Item use unblocked | 23 | 12 |
| Active Regidrago VSTAR | 20 | 6 |
| Printed colored Apex Energy possibly funded | 16 | 10 |
| Public Dragon discard payload absent | 12 | 4 |
| After-Pass owner roots | 3 | 0 |
| All required visible gates simultaneously positive | **0** | **0** |
| Native Compressor selections / settled donor moves | **0 / 0** | **0 / 0** |

**Sequential first failed gate counts** (evaluated in order: held, deck, Item lock, Active VSTAR, Energy, missing payload):

- Seed **3588534981**: 13 roots failed the **held Compressor** gate; the other 10 roots passed all preceding tests but failed **payload missing**. Thus every observed root with held Compressor also had an already available public copyable Dragon payload when the other gates were satisfied.
- Seed **1571178812**: all 12 roots held Compressor; 6 failed **Active VSTAR** and the other 6 failed **payload missing**. No held-Compressor root with active VSTAR also required a first Dragon payload.

**Paired controls:** both physical opening deals were identical in the three arms for their respective group, both repeated-control action traces matched, all six native attempts returned, zero treatment Compressor items were played, and the source's copied-attack choice counts remained [6,6,6] and [4,4,4] across the registered three-arm sequences. Native reported winners remained [1,1,1] and [0,0,0] respectively. These are unqualified engine outcomes.

## Exact native reason a Dragon payload arrived first

I independently downloaded artifact **13267320151**, verified that the ZIP's actual SHA256 matches the CI upload digest, and decoded its original native JSON. The `treasureNativeAudit` receipt array establishes **one completed physical Mysterious Treasure FLI cost-and-target chain per physical source deal**, with `physicalCostDiscards=1`, `physicalTargetRetrievals=1`, `completedPhysicalChains=1`, and `failedOrRejectedReplies=0` in both.

| Historical source deal | Accepted original Mysterious Treasure action | Paid Dragon discarded from actual hand | Physical search target retrieved from source deck | Subsequent source copied attack |
| --- | --- | --- | --- | --- |
| 3588534981 (source seat 1) | Global turn **13** | **Noivern ex PAL** | **Dragapult ex TWM** | Apex Dragon copying Noivern at turns 13, 15, 17, 19, 21 and 23 |
| 1571178812 (source seat 0) | Global turn **8** | **Salamence ex JTG** | **Regidrago VSTAR SIT** | Apex Dragon copying Salamence at turns 8, 10, 12 and 14 |

Both raw receipts include the real native owner `cost` prompt, actual physical discard, owner `deck-hit` prompt, actual target retrieval and final native Item finalization. The public Dragon discard timelines independently show Noivern first appearing on turn13 for the first deal and Salamence appearing on turn8 for the second. All printed names above are sourced from the raw native archive, not inferred from the classifier. The native `sourceNativeCopiedAttackChoices` list confirms the copied attacks were selected; this does **not** by itself establish full paper-legal attacks, Prize payoff, opponent competence or time-limited game results.

**Strategic interpretation (conditional on these two trajectories):** Mysterious Treasure served two setup functions with one Item: discard a copyable attack donor **and** retrieve a useful Pokémon. It therefore made the narrowly proposed *missing-payload* Compressor intervention redundant by the time the later setup gates overlapped. This is a concrete example of connector opportunity and timing, with no proof that Mysterious Treasure universally dominates Battle Compressor or that earlier Compressor use would have been worse in unseen states.


## Interpretation and next experiment

The proposed after-Pass Compressor branch was **never offered a simultaneous owner-visible prerequisite conjunction** in the two previously selected trajectories. The zero activation cannot be attributed to a canonical actor chooser preferring another action at a valid trigger in this specific dataset: there was no valid preflight trigger to compete over. The prior English description of seed 3588534981 as a held-Compressor/funded-VSTAR/missing-payload case was a **temporal conflation**: its component conditions happened at different roots, or a payload was already present by the time Compressor was held.

This evidence rejects a claim of demonstrated policy-selection failure for these two source deals. It also does **not** demonstrate that the after-Pass policy is generally useless or establish its encounter rate. Do not expand the same retrospective seeds to infer a win-rate difference. If this component is revisited, pre-register new naturally dealt original-60 matches and first establish nonzero simultaneous owner-visible triggers under an assembled symmetric policy; only after actual printed payment, native resolution, and opponent follow-through should a payoff be assessed. Consider strategically comparing other ways to establish the Dragon discard before invoking this narrowly funded intervention.

A zero selected action can have multiple mechanisms, and this exact sequential-gate audit is reusable as a general **activation gate** pattern. Keep genuinely unverified Item legality and alternative connector opportunity costs as separate downstream requirements. No competitive or 99.5% claim is supported.

**Field decision remains unchanged:** 29/32 original Aichi Top 32 exact lists authenticated, no selected fixed 60, zero competitively qualified games.
