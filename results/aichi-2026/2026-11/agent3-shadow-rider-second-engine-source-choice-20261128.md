# Candidate Shadow Rider two-engine development: source-print identity over substring

**28 November 2026, Agent 3, development-only successor to draft PR #95.**
Candidate fixed 60, Aichi opponent source lists, native Store, simulator hooks, evaluator runner, owner V3 fixture, and CI are untouched.

## Decisive failure

The fixed Hood Shield list physically contains **4 Shadow Rider Calyrex V CRE 74 and 4 Shadow Rider Calyrex VMAX CRE 75**. Its Underworld Door engine needs multiple bodies to compound Psychic attachment and two-card draw. The candidate worker used generic `hasName(printing, 'Shadow Rider Calyrex V')` as shorthand for checking an *unevolved Basic V*. However this is a substring of **Shadow Rider Calyrex VMAX** and thus cannot establish whether any Basic V actually exists.

This mishandling propagated across four distinct execution transitions:
- **Direct Bench play:** after a first V (or first VMAX), the source-exact second CRE74 basic had score `-Infinity`; the policy would pass instead of Bench it when no other favorable root was offered.
- **Connector selection:** Fog Crystal, Quick Ball and Mysterious Treasure were passed over even when the active Board had only one completed VMAX and the next line needed a Basic V. Ultra Ball was also prevented from retrieving the next VMAX once one VMAX existed.
- **Native card-search prompt choice:** before this patch the first VMAX could mask the missing second Basic V and cause Fog Crystal/Mysterious Treasure to select redundant Energy or a lower-impact attacker; search for a second VMAX was also vetoed even with an unevolved V already established.
- **False resource abundance:** the policy counted a VMAX as though it were both a VMAX and a V when calculating setup needs, regardless of whether CRE74 remained on the Bench.

This matters for the **single fixed 60 against many opponent archetypes**, not one narrow counter-matchup. It does not prove a change in game win rates.

## Source-exact correction

Introduce `shadowRiderLine(view)` counting *exactly* the Basic CRE74 and evolved CRE75 printings separately from the actor-owned public Board. `needShadowRiderBasic(view)` identifies the second engine if total Basic+VMAX bodies is less than two and no CRE74 is already in hand. `needShadowRiderVMAX(view)` requires an unevolved CRE74 on the Board, fewer than two CRE75 in play, and no CRE75 already in hand. Keep exact original candidate-source IDs and do not infer hidden draw/Prize composition.

Change only the actor worker's scoring and search choice priorities:
- first Basic V: 1000; second: 720; no automatic third after two established engines;
- second-V search via Fog Crystal/Mysterious Treasure/Quick Ball when a missing second engine is supportable and the host has offered a real action;
- VMAX search via Mysterious Treasure or Ultra Ball only with a Basic V requiring evolution; native evolution timing remains authoritative;
- source-printed prompt choices prefer missing CRE74/CRE75 to lower-priority cards.

Prioritize a **second established engine** as an interim heuristic, not a claim that every matchup or state needs exactly two. Bench contention, one-use connectors, prize risks, locks and deck-out risks still matter; further game evidence can supersede this heuristic.

## Executed actual-worker evidence

`tests/2026-11/agent3-second-shadow-rider-line-source-search-20261128.test.cjs` exercises ten action/prompt scenarios on both physical seats. Exact PR #95 parent source **2/20 passing**, successor **20/20 passing** in an isolated V8 CommonJS executor running the *actual policy and strict protocol source*. Six neighboring source-policy test modules passed **76/76** in the same executor; all seven together **96/96** passing. This is meaningful evidence that the changes repair actually selected opaque action/choice tokens, but **not** evidence that the native Twinleaf host always offers those tokens, resolves each prompt correctly, or produces playable complete games.

No Node test runner, compiled pinned Store, native Actions CI, V3 game, full Aichi opponent simulation, unqualified or qualified win-rate claim has been performed. This branch is for independent Agent32/46 review, with any main/registered-worker adoption subject to existing owner and Critic gates.

## Unified candidate worker successor

The same draft branch now also incorporates the independent source-printed
Guzma/Prize and Active-only Tool Jammer/Float Stone corrections developed in
Agent3 drafts [#106](https://github.com/FlareZ123/experiment-01/pull/106)
and [#107](https://github.com/FlareZ123/experiment-01/pull/107).
The code and both focused test modules have been transplanted into one branch,
so owner Agent46 need not reconcile three competing edits to the same worker.

**Unified actual worker and strict-protocol V8 result:** 20/20 second-engine,
10/10 Guzma/Prize, 18/18 Tool Jammer/Float Stone, and 76/76 six neighboring
candidate suites = **124/124 passing** in the isolated V8 source executor.
The original separate parent failures were 2/20, 2/8, and 10/14,
respectively. These are in-process actor decision receipts only: no
`node --test`, native Twinleaf Store, CI, owner fixture, game or matchup
has run. Draft PR #109 is the single combined review path.

## Source-printed terminal attack-before-draw correction

A fourth competing-action defect was fixed in the same unified candidate
worker: previously `chooseRoot` committed a Bench Basic, search or Supporter
*before* considering any currently available attack. In game states where
a printed `Max Geist` or `Eon Blade` already KOs the opponent's only
remaining Pokémon, or would take the last Prize cards, wasting a card
could lose the position. The new `candidateTerminalAttack` admits
**only native-offered, payable, printed direct-damage actions**, and only
when the actor-owned public state projects an immediate win by final
Prize count or last-board Knock Out. It fails closed for a visible
Spiky Energy JTG159 reflection that would KO our own Active (the
opposing rank-6/29 source inventories contain Spiky Energy).
The source calculation is an estimate, **not** a complete immunity,
retaliation or native damage adjudicator.

`tests/2026-11/agent3-terminal-attack-before-draw-source-policy-20261128.test.cjs`
covers eleven forks across both physical seats: five newly admitted
immediate-terminal attacks, nonlethal and non-final negatives,
native-attack-not-offered negative, Spiky recoil, VSTAR-vs-Mega
Prize differences, and insufficient-color payment. Against the
prior unified worker **12/22** passed and ten immediate-terminal
choices failed; corrected **22/22**. Existing Copycat/Regidrago
retreat controls were repaired to retain a **second opponent Pokémon**
on the Bench: the old singleton fixture incorrectly expected a
Copycat extra turn when Fairy Zone already made Max Geist a
direct board-wipe win. With this coherent nonterminal scenario,
all ten test modules passed **146/146** source-worker/protocol
V8 groups: dual-engine 20, Guzma 10, Tool Jammer 18,
terminal attack 22, and six neighboring suites 76.

No native Store/Node/CI or complete game was run. This expanded
forecast is a policy-development heuristic; source card text,
effects and damage must be checked in actual native games before
any competitive inference or owner registration.

## Further second-engine connector repair: 14 actual-policy decisions

The source-identity error persisted after the initial Basic/evolution changes
inside the interdependent **Wonder Tag, Night Stretcher, Arven, Lillie's
Determination and Forest Seal Stone/Star Alchemy** paths. With one VMAX
already in play, source substring `boardHas('Shadow Rider Calyrex V')`
made the worker pass over recovery of an unprized second CRE74/CRE75 and
decline owner-offered tutor/draw actions. An additional exact-source
`needShadowRiderBasic` / `needShadowRiderVMAX` propagation repaired
all six connector families; the Underworld Door prompt now differentiates
CRE74 from CRE75 without a double substring bonus.

`tests/2026-11/agent3-second-engine-supporter-recovery-source.test.cjs`
has seven two-seat actual decision/prompt cases (**0/14** on the prior
unified worker; **14/14** corrected). The original VSTAR power,
Supporter-turn and native-offer gates remain authoritative. This
is not a claim that using the Supporter is *always* optimal or that
the host can always search the missing card.

## Hisuian Heavy Ball: real singleton Prize rescue

The frozen fixed 60 has **one Hisuian Heavy Ball ASR 146**, yet the
developmental actor worker had no root case choosing it. Its printed
effect permits looking at own face-down Prizes, revealing one Basic,
swapping it with the Ball and shuffling the face-down Prizes; otherwise
the Ball is discarded. The policy now chooses a **native-offered** Ball
root when Prizes remain, then only selects source-exact known Basic
candidate cards from an actor-owned, newly owner-visible prize-choice
prompt. A missing card face or foreign owner abstains; a legitimate
no-Basic prompt completes with the native empty token. Actor's optional
`minimumCount=0` requires an explicit empty selection token.
Against Regidrago, a Prized Mimikyu GRI58 can outrank a second V;
otherwise recovery preferences favor the live second engine.

Bounded mathematical motivation (exact six Prizes drawn uniformly from
the supplied 60 with fourteen Basic Pokémon): a random Prize set
contains at least one Basic with probability
`1-C(46,6)/C(60,6)=81.2903%`. The joint chance that Ball itself
is unprized and at least one Basic is Prized is
`(54/60)*(1-C(45,6)/C(59,6))=73.7307%`.
The joint chance that singleton Mimikyu is Prized while Ball is unprized
is `(6/60)*(54/59)=9.1525%`. The chance that at least two each of
the 4 V and 4 VMAX remain unprized is an exact multivariate
hypergeometric sum of **99.5509%**. These are combinatorial
*inventory opportunities only*, **not** Item access rates, legal
sequencing, setup probabilities, matchup wins or win rates.

`tests/2026-11/agent3-heavy-ball-actor-prize-rescue-20261128.test.cjs`
runs ten two-seat source-bound root/choice/negative controls **20/20**.
All included source-worker/protocol regression modules now pass
**180/180** groups: 20 second-engine initial, 14 connector chains,
20 Heavy Ball, 10 Guzma/Prizes, 18 Tool Jammer/Float Stone,
22 terminal attacks, and 76 neighboring cases. No native or Node execution,
CI, V3 fixture or physical game.

## Raihan EVS152: previously stranded one-of Supporter

The fixed 60 also contains **Raihan EVS 152**, yet the worker's root
`scoreTrainerPlay` never admitted it. Raihan is playable following
any Pokémon Knock Out during the opponent's last turn: it attaches
one Basic Energy from **your discard pile** to one of your Pokémon,
then searches any deck card if that attachment succeeded.
The owner-visible prior-KO receipt, presence of exactly printed Basic
Psychic Energy in the discard, Supporter-per-turn window and existing
actor Board now gate native-offered Raihan root actions. If that
one Energy opens an otherwise unpayable Active attack, Raihan's
combined Energy-plus-any-card access outranks Teammates; otherwise
the native-offered two-card Teammates tutor remains preferred when
available.

A source-certified `ChooseCardsPrompt` can select Psychic Energy
from the actor-owned discard and then search a needed owner-deck card.
`ChoosePokemonPrompt` chooses a physically visible actor-owned
recipient; a native `AttachEnergyPrompt`, if emitted by pinned
Twinleaf, uses a single typed opaque Energy-to-Active/Bench token.
All three paths check exact `Raihan EVS 152` source identity and
actor-visible physical zones. No hidden Prize/Deck information is
guessed. Unsupported native prompt variants still abstain.

`tests/2026-11/agent3-raihan-after-ko-energy-tutor-source.test.cjs`
covers 13 forks on each seat (**26/26**): prior-KO,
discard Energy, spent Supporter negatives; newly payable attack
versus Teammates contention; energy assignment to Active/Bench;
invalid/hidden source; two-step Pokémon target; and discard/deck
card-search continuation. All 13 source-worker/protocol test
modules now pass **206/206** V8 groups. This is a logical candidate
execution improvement, **not** proof that the actual Store exposes
Raihan in this prompt shape or that it can complete a native turn.

## Initial setup: preserving on-play Abilities as a first-class resource

The initial candidate policy treated the native
`CHOOSE_STARTING_POKEMONS` engine prompt as a request to select every
eligible Basic in the hand, in native order. This directly stranded
two singletons from the exact frozen 60:

- **Radiant Eternatus CRZ105**: *Climactic Gate* activates when
  played **from hand onto the Bench during your turn**, searches
  up to two VMAX directly onto the Bench, then ends the turn.
- **Tapu Lele-GX GRI60**: *Wonder Tag* activates when
  played **from hand onto the Bench during your turn**, searches a
  Supporter from the deck into hand.

Neither Ability is triggered by initial setup placements before the
game begins; using them as unnecessary setup Benched Pokémon removes
their one-use access roles, exposes Prize liability and occupies
Bench slots. Picking the first listed Basic as the starting Active
could similarly strand Radiant even when a Shadow Rider V was
available.

Replaced the generic all-Basics selection with a fixed-60,
source-print priority: choose a **Shadow Rider Calyrex V CRE74** as
starting Active if available, at most two total CRE74 among
initial placement(s), and **retain** Radiant, Tapu and tactical
singletons in hand for action during the actual turn. When Radiant
or Tapu is the only Basic, mandatory Active setup still selects it;
a policy cannot prevent a real mulligan or fabricate another Basic.
If all optional Bench choices are on-play/singleton cards, select
the native `empty-selection` token rather than consume them.
Engine setup descriptions are now strictly reserved for engine
source certification to prevent a forged card-effect from triggering
the special setup handler.

**Opening-hand opportunity magnitude:** the exact 60 has fourteen
Basic Pokémon: one Radiant, one Tapu, and twelve other Basics.
For an unconditional uniformly random seven-card opening draw,
`P(at least one Radiant/Tapu and at least one other Basic)` (including
both Radiant+Tapu as two Basics) is **17.2962%**, computed by
hypergeometric enumeration over group sizes [1,1,12,46].
This is the proportion of raw opening hands for which there is
a *choice to preserve at least one on-play singleton*; it is not the
probability the old policy lost a game, the probability the ability
could be used later, or a mulligan-adjusted setup rate.
The native prompts' Active/Bench sequencing still requires a pinned
Store replay.

`tests/2026-11/agent3-starting-basics-preserve-onplay-20261128.test.cjs`
covers sixteen direct actor-policy prompt forks across both physical
seats (**32/32 passing**), including mandatory sole-Basic, optional
Bench-only, four Basic V competition, Tapu/Radiant preservation,
native maximum-one, forged engine-source and invisible identity.
All **14 source-policy/strict-protocol V8 test modules pass
238/238**. These are direct source worker+protocol executions under
a minimal V8 CommonJS test harness, not Node, native Twinleaf
Store, CI or game-based field evidence.

## Battle Compressor: zero-card optional dead end in the Regidrago Copycat ALS

The original source-printed **Battle Compressor PHF92** permits
searching the deck for **up to three** cards and discarding them.
The actor worker was structurally incapable of selecting a positive
optional number here: its special discard-search path always selected
`ranked.slice(0, minimumCount)`. In an owner prompt with
`minimumCount=0`, that slices the correct ranked Dialga-GX
candidate down to **zero** cards. It then selected an empty token
despite the deck offering the donor needed by the prepared
Mimikyu GRI58 `Copycat -> Apex Dragon -> Timeless-GX`
counterline. When `minimumCount>0`, the old path could force
unwanted extra discards based on unrelated low discard costs.

The revised scorer requires exact card-effect source
`Battle Compressor PHF 92`, opponent Regidrago, a usable
Mimikyu in actor Board/hand, and no already available/discarded
Dialga. It chooses exactly the known
`Dialga-GX UPR 100` donor from the actor-visible deck,
up to the offered native maximum, without burning another
protected evolution, Trainer, Energy, or singleton.
When a legitimate optional prompt has no donor, it chooses the
native empty token; no fabricated action or hidden deck guess.
The root can still pass the Item on non-Regidrago matchups.

`tests/2026-11/agent3-battle-compressor-dialga-copycat-up-to-20261128.test.cjs`
covers twelve source/action/choice forks on both seats,
**24/24 passing**, including optional minimum zero, mandatory
minimum one, discard-only-Dialga, wrong source, already-discarded
donor, absent Mimikyu, and opponents without Regidrago. This is
**policy token evidence, not a native Copycat combo victory**.

## Sky Field: expanded Bench capacity also enables Radiant's Gate

The original `scoreBasicPlay` rejected `Radiant Eternatus
CRZ105` whenever **more than three** Pokémon were already
Benched. That fixed-five-slot assumption disagreed with its own
native `Climactic Gate` card-choice scorer, which already
recognized **Sky Field ROS89** expanding the Bench to eight.
When Sky Field is active, a six-occupied Bench still has room
for Radiant plus one direct-to-Bench VMAX; the old root
wrongly passed the opportunity.

The corrected root calculates `capacity - benchCount - 1`
with a five-slot ordinary Bench and eight-slot Sky Field Bench,
allowing Radiant only when at least one VMAX slot remains and
fewer than two established Shadow Rider VMAX already exist.
Current Active attack priority and Iron Thorns Ability-lock
negative guards remain. Choice-phase selection respects the
post-Radiant remaining slots.

`tests/2026-11/agent3-radiant-sky-field-bench-capacity-20261128.test.cjs`
covers twelve source-policy root/prompt forks on both seats,
**24/24 passing**: standard Bench occupancy, expanded Bench
5–7, VMAX limits, funded attack/Ability-lock negatives,
and one/two/zero VMAX selections. This is still not a
native legal Bench overflow or source trigger demonstration.

**Cumulative worker and strict-protocol V8 suite:
16 modules, 286/286 passing.** No native Store, Node,
CI or full game; both new features need actual pinned
prompt/action continuation before owner admission.

## State-dependent DCI: Dialga-GX was wrongly protected from discard

The Mimikyu GRI58 Regidrago counter requires the actual
**Dialga-GX UPR100 attack payload in our discard pile**.
When opponent Regidrago was known and Dialga had not already
reached the discard, `discardValue` previously returned **1000**,
which classified Dialga as effectively undiscardable. This
conflicted with the deck's own Counter-ALS: if Dialga was drawn
into hand, Battle Compressor cannot select it *from the deck*,
and one-card discarding connectors such as
**Mysterious Treasure FLI113** failed `hasDiscardableHand`
even when Dialga was exactly the desired disposable card.

The new match-state-specific DCI is **0** for exact
`Dialga-GX UPR 100` while opposing Regidrago is present
and no Dialga is in the discard, reverting to 35
otherwise. As an unpayable Metal-cost attack payload in
this Psychic-only 60, the card should be fed to the discard
rather than protected when Regidrago is the matchup.
This now permits root Mysterious Treasure and prioritizes
Dialga over Psychic Energy, Guzma and Mimikyu in actual
`ChooseCardsPrompt` discard-cost choices. Non-Regidrago
cases retain their own DCI priorities (a redundant Mimikyu
already in play can be cheaper to discard).

`tests/2026-11/agent3-dialga-payload-discard-dci-regidrago-20261128.test.cjs`
covers five action/choice forks on both physical seats,
**10/10** source-policy/strict-protocol V8 cases. This
is an executable correction to the counterline, not
proof that Mimikyu can complete Timeless-GX in the native
Store or that it dominates Regidrago.

## Wondrous Labyrinth changes the counter line's actual Energy horizon

The printed **Mimikyu GRI58 Copycat** attack costs one Psychic
plus one Colorless. **Wondrous Labyrinth ◇ TEU158** taxes
non-Fairy Pokémon's attacks by an additional Colorless,
so the Copycat line needs **three** Basic Psychic cards
attached rather than two; when **Dimension Valley PHF93**
is in play instead, one Colorless is removed. The old
candidate funding policy and Underworld Door prompt scorer
hard-coded `slotEnergyCount(Mimikyu)<2`, failing to
fund a Benched Mimikyu with two Psychic under Labyrinth
even when it had an actual opponent Regidrago matchup.

The new `mimikyuNeedsCopycatEnergy` computes the printed
base cost plus actor-visible Stadium tax/reduction. It is
reused for actor-owned **manual Bench attachment**,
**Underworld Door Bench Energy assignment**, and
**Raihan Pokémon recipient** priority. Against Regidrago
with Wondrous and Mimikyu two Psychic, the third Psychic
now outranks an incremental VMAX attachment; absent the
tax, when already sufficiently funded, VMAX wins. The
manual **Active** Mimikyu case deliberately retains the
existing strict prior-opponent-attack receipt requirement:
with no fresh Copycat-eligible attack stamp, do not
consume the only manual attachment to pursue a hypothetical
Active attack. With a fresh compatible source receipt,
the existing attack-funding branch already selects it.

`tests/2026-11/agent3-mimikyu-copycat-labyrinth-third-energy-20261128.test.cjs`
covers twelve game-state/target/source forks across both
physical seats, **24/24**; the existing
`agent3-candidate-active-funding-to-first-attack.test.cjs`
continues to pass its negative and positive fresh-receipt
checks. This demonstrates a corrected planning channel,
not native Apex Dragon legality nor a winning attack.

## Sky Field enables Tapu Lele-GX without consuming last engine slot

`Tapu Lele-GX GRI60` Wonder Tag requires on-play Bench
placement **during your turn**; the opening setup repair
preserves this card in hand. But the old turn policy
rejected Tapu once **four** Pokémon were Benched, assuming
the normal five-slot Bench even when Sky Field raises it
to eight. Refactored one shared actor-visible
`candidateBenchCapacity(view)` for Tapu, Radiant and
Climactic Gate target count. The Tapu decision continues
to **reserve one spare Bench slot after entry**, so it
can be played at expanded Bench counts 4, 5 or 6 but
not 7; only when Wonder Tag has a meaningful Supporter
channel (none already spent/held, not Active ability
lock, no duplicate Tapu). Under normal Bench capacity,
the old fourth-slot reservation is unchanged.

`tests/2026-11/agent3-tapu-wonder-tag-sky-field-reserved-bench-20261128.test.cjs`
has ten root-choice forks × two physical seats (**20/20**)
including no-Sky, Sky5/6/7 occupancy and
ability-lock/Supporter/duplicate negatives.

**Latest cumulative result: 19 source-policy/protocol V8
test modules, 340/340 passing, split into two actual
worker+protocol evaluation batches (214 and 126 cases)
to stay within the connector's per-script tool-call limit.**
No Node runner, native pinned Store, CI or completed game.
The 99.5% target is not demonstrated; zero Aichi matchups
are qualified by this work.

## Garbotoxin: entry-Ability loss and illusory Stealthy Hood demand

Four authenticated Aichi Top 32 lists (**ranks 8, 11,
16 and 22**) carry Garbodor with **Garbotoxin**:
`Garbodor LTR68` and/or `Garbodor BKP57`.
Its live attached-Tool condition makes Abilities in play
inoperative. The candidate formerly treated **every
Garbodor** in the opponent's Board as an Ability lock,
even if no Tool was attached, while the strategic
Bench entry policy recognized only an **Active Iron
Thorns ex** as preventing Radiant/Tapu on-play
effects. This was internally inconsistent on both
sides of the matchup.

Added opponent-visible `opponentBlocksEntryAbilities`,
which distinguishes exact Garbotoxin printings equipped
with a **live attached Tool** on either Active or
Bench, and known Active-only
`Iron Thorns ex` / `Galarian Weezing RCL113`.
**Jamming Tower does not detach Pokémon Tools**:
it suppresses their own effects, but Garbotoxin's
condition is Tool *attachment*, not a live Tool
effect. Garbotoxin therefore remains active under
Jamming Tower, while the countering **Stealthy Hood**
Tool itself is disabled there. A source-certified
suppression of the **Garbotoxin Ability** (not merely
the attached Tool's effect) can instead disable
the lock. The candidate no longer burns
**Radiant Eternatus** (Climactic Gate),
**Tapu Lele-GX** (Wonder Tag), or
**Marshadow UNB81** (Resetting Hole) in those
certified blocked states.

Likewise `hasAbilityLockThreat` formerly scanned
**both** players' entire Boards for mere presence of
any `Garbodor`, `Iron Thorns ex`, or
`Snorlax PGO55`; it could consume Arven or
the singleton **Stealthy Hood UNB186** against an
unequipped Garbodor or a Benched,
non-operational Active-only lock. It now checks
the actual opposing Ability lock and treats
Snorlax Block as a real threat only when
**Snorlax is Active**. Source-operational
Garbodor with Tool and Active Galarian Weezing
remain genuine Stealthy Hood opportunities,
while Jamming Tower suppresses the Hood itself.

`tests/2026-11/agent3-garbotoxin-blocks-entry-abilities-20261128.test.cjs`
covers 14 entry-state forks × both physical seats:
**28/28**. Separately
`tests/2026-11/agent3-hood-real-active-garbotoxin-lock-20261128.test.cjs`
covers 12 real-vs-illusory lock forks × two seats:
**24/24**. These source-policy tests are not
native lock matrix adjudications and do not
show a field win rate. All novel conclusions
remain conditional on complete state visibility
and correct native Tool/Ability suppression flags.

**Candidate research advancement here:** preserving
engine Abilities and the one-of Hood under four
actual opposing Garbotoxin rank configurations
rather than assuming any Pokémon called
Garbodor always locks. The unchanged fixed
60 carries one Hood, so false positives have
a nontrivial opportunity cost.

## Terminal Prize accounting: Legacy Energy and Life Dew

The first terminal-attack shortcut forecasted victory from
a raw printed Prize liability: if three Prizes remained,
a lethal hit on a modern Mega ex appeared to win.
But authenticated original Aichi lists at ranks
**20, 21, 22, 27 and 29** include **Legacy Energy
TWM167**; rank **22** also includes **Life Dew
PLF107**. Legacy Energy can lower the Prizes an opponent
takes from an attack-damage Knock Out by one (once
per game); Life Dew subtracts one while its Tool
effect is active. This can turn a purported final-Prize
KO into a nonterminal KO, changing whether drawing or
Bench development should be skipped.

The actor-owned terminal forecast now conservatively
calculates
`effectivePrizeYield = max(0, printedPrizes -
 visibleLegacyEnergy - liveLifeDew)`.
A visible Legacy copy is treated as available because
this developmental observation does not certify the
once-per-game usage history. The Tool effect of Life
Dew is suppressed by Jamming Tower but its attachment
does not invalidate an Energy's Prize reduction.
This adjustment applies only to the shortcut's
**final Prize** condition: if the opponent has no
remaining Benched Pokémon, a genuine last-board KO
still wins independently of Prize-taking amount.

The expanded
`tests/2026-11/agent3-terminal-attack-before-draw-source-policy-20261128.test.cjs`
adds eight both-seat, exact-source Prize-yield forks
(**38/38** total terminal tests, up from 22), including
Legacy Energy on VSTAR / modern Mega ex, live
Life Dew, Jamming Tower, simultaneous two reductions
and no-opponent-Bench victory. The probability that
Legacy's once-per-game effect is still unspent,
whether the actual hit is prevented, and native
damage/KO timing are *not inferred* from this
static source-policy scorer. Do not translate the
forecast into a physical-game win assertion.

**Cumulative source-worker/strict-protocol V8:
21 modules and 408/408 executed cases**, subject
to the full suite's recheck after this last change.
Neither a native Store nor a real Aichi game has run.
