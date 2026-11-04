# Agent 5: exact alternate Switch route for the unchanged ADP–Thorton–Regidrago v2 opening

**4 November 2026 | exact physical-card combinatorics | 0 competitively qualified games**

## Question

How much does allowing a *non-ADP starting Active*, followed by a real first-turn **Switch** and an ADP access card, improve the narrow going-second first-own-turn *Altered Creation-GX* resource opportunity? The previous [Agent 1 exact ADP-starting baseline](agent1-adp-firstturn-active-line-prize-bonus-20261104.md) correctly measured **28.9936530125316%**, conditional on an initially Basic-valid seven and one ordinary draw. That baseline did not enumerate an alternate starting Active.

This independent extension uses the exact **unchanged v2** [60-card registered printings](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json), preserving two ADP, five other Basics, two Switch, four Tag Call, three Quick Ball, four Ultra Ball, three Guzma & Hala and four Double Dragon Energy.

## Mutually nested physical resource screens

All screens assume going second and only the initial seven, six unknown physical Prizes and the first normal turn draw. A Basic in the starting seven is required. Choose ADP Active when it is held initially. If the initial seven contains no ADP, choose one of the other five Basics Active, then require a **Switch physically held/drawn in the first eight**, and an ADP either drawn on the first turn or obtained from the post-Prize deck. The candidate's five other Basics leave a Bench slot for ADP after an initial non-ADP Active.

The Energy screen is identical to Agent 1's narrow mechanism: a directly held/drawn Double Dragon Energy, or Guzma & Hala from the first eight searching an unprized Double Dragon Energy, or Tag Call from the first eight searching an unprized Guzma & Hala which can obtain an unprized Double Dragon Energy. Tag Call can also search an unprized ADP as its other TAG TEAM card. The later screens allow Quick Ball and then Ultra Ball *only to find ADP*. They do not add alternative Supporter/Energy routes.

| Nested opening mechanism | Conditional exact probability | Increment vs preceding mechanism |
| --- | ---: | ---: |
| ADP Active in initial seven + Agent1 three Energy access routes | **28.993653%** | baseline |
| Above + first-eight Switch, first-turn-drawn ADP or Tag Call→deck ADP | **34.849530%** | **+5.855877 percentage points** |
| Above + Quick Ball→deck ADP when Tag Call cannot find it | **36.456101%** | **+1.606571 points** |
| Above + Ultra Ball→deck ADP when prior searches cannot find it | **37.981531%** | **+1.525430 points** |

Only **0.344830%** of accepted starting sevens can use the Switch branch by *directly drawing the ADP* on the first normal draw while also meeting the above Energy screen. The other **5.511046 points** of the Tag Call-level Switch branch require ADP access through Tag Call. The maximal four-router screen leaves **62.018469%** of accepted sevens outside this named first-eight access envelope.

### Exact integer results

The accepted seven-card physical-hand count is **232,063,840**. The exact denominator, counting accepted hands × possible named next draws × eligible six-Prize sets conditional on the named draw, is

**250,397,245,379,590,400**.

| Disjoint or nested component | Favorable weighted physical allocations |
| --- | ---: |
| Starting ADP baseline, independently matching Agent1 | 72,599,308,478,295,760 |
| Alternate Switch with first-draw ADP | 863,445,917,814,592 |
| All alternate Switch through Tag Call | 14,662,953,552,325,061 |
| All alternate Switch through Tag Call or Quick Ball | 18,685,764,197,723,998 |
| All alternate Switch through Tag Call, Quick Ball or Ultra Ball | 22,505,397,693,322,639 |
| Combined maximal named route | **95,104,706,171,618,399** |

The selected categories are disjoint physical card groups. For an initial seven-card hand category count vector **h**, an observed turn draw from group **i** has multiplicity **C(n,h) × (n_i − h_i)**. Conditional on the named first-eight identities, each six-card Prize set among the remaining 52 is equiprobable by exchangeability; enumerate the exact prizes allocated to ADP, Guzma & Hala and Double Dragon Energy, with all other cards combined. The weighted denominator is equivalent to the original chronological procedure in which Prizes were placed *before* the first normal draw. No policy is given actual Prize identities or deck order.



## Slot-sensitivity counterfactuals on the same access screen

The same exact enumerator can expose the **opportunity cost of one unspecified non-Basic filler slot** without changing or claiming a newly admitted fixed 60. Change the category-count vector in its recorded order \`[ADP, other Basic, Switch, Tag Call, Quick Ball, Ultra Ball, Guzma & Hala, Double Dragon Energy, other]\`; each hypothetical addition is offset by decrementing \`other\`. These are *hypothetical mathematical vectors*, never silently substituted into the published v2.

| Hypothetical exact 60-category change | Maximal named first-eight access | Difference versus unchanged v2 |
| --- | ---: | ---: |
| Unchanged published v2 | 37.981531% | baseline |
| 2→3 ADP | **45.783445%** | **+7.801915 pp** |
| 2→3 Switch | **41.840568%** | **+3.859038 pp** |
| 3→4 Guzma & Hala | 39.453730% | +1.472200 pp |
| 3→4 Quick Ball | 38.273130% | +0.291599 pp |
| 2→3 ADP **and** 2→3 Switch, remove two others | 49.077640% | +11.096110 pp |
| 2→4 ADP, remove two others | 51.782950% | +13.801420 pp |

The one-slot mathematical gain from a third ADP is substantial on this **narrow access metric**. It is not evidence that adding the card is a strong deckbuilding decision. In particular, replacing either of v2's two Field Blower answers potentially reopens the actual Temple of Sinnoh / Garbotoxin counter cluster the v2 change was designed to address. Removing a discard outlet, Recovery card, Dragon payload or Energy can damage the later T2 chain. Both the conditional Basic-valid-hand denominator and access numerator change when adding an ADP. A real structural card swap must be evaluated under the same complete original-source policy and opponent continuation.

These numbers give a clear prioritization hypothesis: test whether **an extra starting ADP** can yield enough reliable, paper-paid early attacks to compensate for a lost slot *after* a shared policy meets its legality and opponent-competence gates. Do not substitute this physical resource estimate for game wins.

## Verification

- [New BigInt enumerator](../../simulation/evaluation/agent5-adp-switch-first8-exact.cjs): builds printed categories from the unchanged registered 60, refuses silent inventory changes, enumerates valid initial hands, first draw and physical Prize configurations. Its fixed60 baseline numerator and denominator exactly reproduce Agent1's independently derived result.
- [Three local Node 22 tests](../../tests/agent5-adp-switch-first8-exact.test.cjs): registered-card census and exact Agent1 equality; physical-card brute-force enumeration on three toy decks (explicit first seven, Prizes, turn draw versus category enumerator); monotone search-route inclusion and a zero-Switch negative control. **All 3 passed in the local runtime.** No claim of compiled Twinleaf or GitHub Actions CI passing this new contribution.
- Bundled card-list.zip printing text checked for CEC 156 ADP, ROS 97 Double Dragon Energy, CEC 193 Guzma & Hala, CEC 206 Tag Call, SVI 194 Switch, SSH 179 Quick Ball and BRS 150 Ultra Ball. All three other starting Basic printings (Regidrago V, Tapu Lele-GX, Crobat V) have nonzero printed Retreat Costs. The one-hand-Energy-turn restriction is in the supplied Advanced Player's Rulebook I.C.

## Interpretation and next falsifier

**These are deliberately optimistic, necessary physical resource-access screens for specific lines, not executable-success probabilities and not a general upper bound on any possible first-turn GX.** Guzma & Hala's optional two-card discard, Quick Ball's one-card discard, Ultra Ball's two-card discard, Item/Supporter lock, already occupied Bench choices, timing, damage, interference, target correctness and the actual GX resolution are absent. Some opening states may require competing uses of the same cards, and a physical line counted here can fail. Other lines via Tapu Lele-GX, Supporter access, retreat modifiers or more complex turns are outside the screen.

Under the simplest chosen mechanisms, **starting Active/ADP access, a physical Switch, and DDE/G&H access are the measurable first-turn bottlenecks**. Before changing any deck slots, test the exact candidate in the selected Issue #25 shared two-seat policy, tracking owner-hand costs, paper-valid Switch selection, ADP Bench→Active, actual Special Energy attachment, Altered Creation-GX with additional Water condition, the original opponent reply, and the longer T2 Thorton/Apex chain. Against original rank 6, specifically retain both Energy-denial and Ability-lock counterplay. A prettier resource-access probability alone cannot promote this candidate over the existing fixed-60 shortlist.

**Global state:** 29 authenticated original source inventories out of 32 (ranks 23/25/28 missing), zero competitively qualified games, no selected best fixed 60 and no demonstrated 99.5% field win rate.
