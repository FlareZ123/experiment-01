# First-turn Shadow Mist: a no-swap special-Energy choke against all three Aichi Iron Thorns lists

**Agent 15 | 28 November 2026 | printed card-text and original source inventories; paired, simplified 60-card opening experiments. No native games, full opponent decision policy, matchup win estimate or deck nomination.**

## Actual fixed-60 line

All three authenticated Iron Thorns ex Top32 lists (**ranks 6, 24, 29**) contain **zero Basic Energy**. Their entire Energy allocation is Special Energy: four Speed Lightning Energy, one to three Double Colorless Energy, Capture Energy and sometimes Spiky Energy. Iron Thorns's **Volt Cyclone** costs Lightning + two Colorless and deals 140. **Thunder Mountain Prism Star** can remove its Lightning attack requirement, allowing a **single Double Colorless Energy** to pay the remaining two Colorless immediately. All three source sixties play one Thunder Mountain and two Guzma & Hala plus two Tag Call; rank24 plays three Double Colorless, ranks6/29 one each.

The unchanged leading Hood Shield fixed 60 already contains **four Shadow Rider Calyrex V CRE74**. Its **Shadow Mist** attack costs only **one Psychic Energy**, does 10 damage, and during the *opponent's next turn* prevents that player from playing **Special Energy or Stadium cards from their hand**. This is an effect **on the opposing player** and is not turned off just because Iron Thorns's Initialization suppresses our Pokémon V Abilities. It also does not depend on Radiant Eternatus's on-play Ability or a Stealthy Hood.

**Practical action:** When the candidate can attack with Rider V before the source has funded Volt Cyclone, attacking with **Shadow Mist** can stop further manual Special Energy attachment and Stadium placement during the upcoming source turn. Repeating it on later turns can extend the denial while the candidate naturally establishes evolution/Hood-protected Door access. The source cannot use **Guzma & Hala's search** to bypass the prohibition on *playing* the resulting Special Energy/Stadium from hand that turn. Searchability and playability are distinct.

**Crucial limits:** Shadow Mist does **not** remove Energy already attached or an already-played Thunder Mountain; it does **not** forbid Item or Supporter use, discard effects, gust, or non-hand attachments. Any of **Guzma (2–3), Plumeria (4), Team Flare Grunt (2), and Crushing Hammer (where included)** can potentially displace the Active Rider or remove its single attached Psychic, preventing repeated Mist. Source can use its ACE SPEC **Megaton Blower** to remove Hoods from a later protected-Door follow-up. Source must access these cards and satisfy their costs/coin conditions; their inclusion alone doesn't establish a winning reply. Underworld Door remains unavailable while live Initialization suppresses unhooded Rule Box VMAX.

## Two-sided opening physical model

The [reproducible JS model](../../../scripts/2026-11/agent15-shadow-mist-thorns-energy-lock.cjs) samples **200,000** full 60-card opening deals **per rank** across seeds `28112029` and `28112030`, with seven-card opening, six randomized Prize cards and one natural first-turn draw. Each paired candidate/source hand must contain a legal Basic at setup. Candidate uses the **unchanged Hood 60**. Each source rank's exact counts of Iron Thorns (4), Double Colorless (rank6=1, rank24=3, rank29=1), Thunder Mountain (1), Guzma & Hala (2), Tag Call (2) and Trainers' Mail (rank6=3, rank24=4, rank29=2) are represented; all other original source cards are 60-card physically conserved filler for this restricted question. This preserves exact occurrence probabilities of the specified cards, but doesn't simulate their other effects.

**Candidate-going-second case** (source goes first, cannot play Supporter on its first turn):

- A conservative, straightforward candidate opening policy selects **Shadow Rider V Active if the initial seven contain one**. This opening selection must be made **before** the opponent's facedown Active is revealed, so it is *not* a post-reveal adaptive Iron Thorns policy. If selected Rider starts Active, it can Shadow Mist on its first turn with an ordinary manual Psychic from hand, **Fog Crystal→Psychic**, or first-turn **Arven→Fog Crystal→Psychic**. The model checks the requisite physical unprized search targets. No pivot into Rider from another Active, generic draw Supporters, mulligan bonus or other search acceleration is counted.
- Source's direct T1 attack-ready pair requires **Double Colorless Energy and Thunder Mountain in its first-turn hand**. A second source route uses held Trainers' Mail to find the one Mountain among the top four, if DCE is already held; with multiple Mail the exact conditional chance is `1−(1−4/46)^m` for `m` Mail held, assuming failed look-and-shuffle resets the deck order. This accounts for a meaningful source first-turn Item but not every alternative draw or trainer interaction.
- Count a *timing opportunity* when the candidate has playable first Shadow Mist and source hasn't already established DCE+Mountain by the end of its first turn. The model does **not** execute opponent attacks, future Shadow Mist repeats, Stadium removal, source hand disruption, Tool lock or Prize collection.

**Source-going-second case** (candidate goes first and therefore cannot use Shadow Mist on its first turn):

- Count an **early Volt funding opportunity** if source can directly present DCE+Mountain, or can use held **Guzma & Hala** or held **Tag Call→Guzma & Hala**, with an available unprized DCE and Mountain plus two remaining discardable hand cards where special-Energy search is required. The model checks 60 physical positions and source's Supporter turn, but omits Trainers' Mail into another connector, extra card draws, and strategic protected-discard valuation. This is a restrictive, not exhaustive, access screen.
- This measure is *not* opponent chance to attack and win on T1: it assumes Thorns is Active, there is no effect prevention or Item/Supporter restriction, and source chooses to execute the accessible line.

## Measured restricted opportunities

<escape>The percentages below are conditional on **both players having a Basic in their first physical seven**, not all shuffles or actual tournament games.</escape>

| Source rank | Candidate can T1 Shadow Mist when going second | Source T1 direct DCE+Mountain when going first | Source T1 ready including held Mail into Stadium, expected | Candidate Mist & source not directly ready (incl. modeled Mail) | Source first-turn ready via direct/Guzma & Hala/Tag when going second |
|---:|---:|---:|---:|---:|---:|
| **6** | **42.28%** | 1.22% | 1.49% | **41.70%** | 33.82% |
| **24** | **42.19%** | 3.49% | 4.48% | **40.31%** | 39.14% |
| **29** | **42.17%** | 1.24% | 1.41% | **41.57%** | 33.91% |

The measured **40–42% opening window is not a 40–42% game win rate**, and the inverse is not a loss rate. Importantly, the source going-first direct readiness count **understates real source access** because full Trainer's Mail chains, other Items, and alternate tactics aren't comprehensively modeled. The going-second G&H chance likewise omits other draw/search routes. Candidate starting Rider is not necessarily the globally best Active across all32 matchups; a fixed-deck policy cannot magically identify opponent Iron Thorns from a face-down Active before setup. A good source can apply energy removal/gust during the lock, whereas an unprepared source may have no legal hand attachment for several turns.

The high source-going-second G&H opportunity highlights a **seat-dependent tempo asymmetry**: after the candidate goes first and cannot attack, source may use a Supporter-led DCE+Thunder Mountain first turn, before candidate can ever Shadow Mist. This makes *going second to enable immediate Shadow Mist* a serious decision to test **against Iron Thorns**, not a global coin-flip directive before matchup information exists.

## Integration with the stronger late-game plan

This result advances the [unchanged Hood natural T2 Bench Hood route](agent15-natural-benched-rider-hood-vs-thorns-20261128.md), whose protected Underworld Door is accessible in only about **20–23%** of Basic-valid openings under a much narrower no-extra-draw model. The two strategies serve different purposes:

- **Immediate Shadow Mist** suppresses source's future Special Energy/Stadium hand plays while the candidate still has only one Psychic.
- **Natural Rider evolution + Benched Stealthy Hood** can restore one Underworld Door despite Initialization, preparing more threatening attacks if Hood remains attached.
- **Flutter Mane** can temporarily disable Iron Thorns Initialization to permit Radiant Gate, but the 90-HP Basic often dies to Volt Cyclone and the lock returns ([diagnostic](agent15-flutter-mane-vs-iron-thorns-one-turn-window-20261128.md)).
- Source's Megaton Blower can erase the Hood line; source Plumeria/Hammer/Team Flare Grunt may interrupt Shadow Mist. A production policy should not treat these protections as permanent or freely combined; build reachable sequences under present hand, Supporter, Tool and Bench constraints.

**Recommendation, not a result:** in an existing bounded candidate worker, add a matchup-conditioned **Rider Shadow Mist T1 and energy-denial follow-through** evaluation versus known Active Iron Thorns. Before opening Active is revealed, use a global starter policy rather than an illegal opponent-oracle. Check currently attached Special Energy, source Stadium, our manual Psychic and Fog/Arven availability. After the first Mist, evaluate whether preserving another Psychic to reattach after Plumeria is better than chasing an unprotected Gate. Do not swap Teammates for Flutter or add a third Hood based solely on these opener estimates.

## Reproduction and status

[Script](../../../scripts/2026-11/agent15-shadow-mist-thorns-energy-lock.cjs) and [regression](../../../tests/2026-11/agent15-shadow-mist-thorns-energy-lock.test.cjs), with exact 2,000-seed counts, passed the same executable JS source and fixture invariants in the connected runtime. To rerun locally, `node scripts/2026-11/agent15-shadow-mist-thorns-energy-lock.cjs 100000 28112029` and repeat seed 28112030; run Node's test file as usual.

Card rules verified from supplied English prints CRE74, TWM77, PHF93 and trainer printings; original source rank counts from the authenticated 29-list corpus. No matchup games, CI, Twinleaf engine, fixed 60 or another agent's worker changed. **99.5% game win rate remains unproved, zero qualified full-field matchups.**
