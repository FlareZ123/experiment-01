# Agent 25: Dhelmise v2's Stadium-only random donor recovery under established Vileplume lock

**3 November 2026, printed-text and exact combinatorial stress test.** The exploratory Dhelmise v2 remains a post-event unchanged 60. The opponent field remains 29 authenticated original printed sixties, missing ranks 23/25/28. Zero paper-qualified native games and no estimated matchup win-rate change result from this analysis.

## Source threat is specific and public-printing grounded

The immutable [Aichi original-60 archive](../aichi-2026/full-decklists.json) contains:
- Rank **2** Vileplume Control: **2 Vileplume AOR 3**, whose Irritating Pollen Ability prohibits all Item cards from players' hands, plus **1 Stoutland BCR 122**, whose Sentinel Ability prohibits the opposing player's Supporter cards from hand while Stoutland is Active. When Vileplume is live and Stoutland is Active, Item and Supporter playing are simultaneously unavailable to the Dhelmise opponent.
- Rank **15** Lopunny/Vileplume: **2 Vileplume AOR 3** plus **1 Silent Lab PRC 140**. The Stadium removes Basic Pokémon Abilities, including Shuppet's Hide 'n' Sneak in discard and the candidate's Clefairy ex Fairy Zone, as long as Silent Lab is the effective Stadium.

Printed inclusion is the necessary prerequisite for those hypothetical lock boards. Neither board's establishment probability, source-bot competence, opponent clock or the actual native attack/payoff was measured here. The separate [rank 15 source-deal tests](../aichi-2026/agent36-rank15-authentic-duallock-exposure.md) describe how difficult specific real lock sequences can be.

## Candidate direct donor-discard channels under the rank-2 board

The exact candidate [v2 fixed 60](agent25-dhelmise-mixed-lock-answers-v2.json) contains **12 Item copies capable of selecting Hide 'n' Sneak donor Pokémon for discard**: 4 Battle Compressor (deck to discard), 1 Brilliant Blender (deck to discard), 4 Mysterious Treasure (hand-payment discard), and 3 Quick Ball (hand-payment discard). All twelve are prohibited by the effective Vileplume Item lock. Arven and other Supporters are separately prohibited if the original source has Stoutland Active; Faba could otherwise remove a Tool but does not itself discard the owner's donor Pokémon. Four Unown Farewell Letter draw and discard themselves, not an HNS donor.

Exactly **one PokéStop PGO 68** remains in the candidate as an explicitly selected donor-discard effect available while both Trainer classes are locked. Its Stadium ability can discard the top three cards of the deck once per owner's turn. Banette's Puppet Pull attack can search for PokéStop but does not itself discard a donor. Opponent-caused Knock Outs, already discarded donors, deck thinning and lock removal may supply other routes and are outside this isolated direct-access model. A single PokéStop is among the opening eight cards with unconditional random-location probability **13.3333%** and is initially Prized with exact probability **10%** (before any Prize cards are taken).

**Dynamic Stadium correction:** Playing PokéStop replaces the effective Silent Lab Stadium. Thus a rank-15 state with both live Vileplume Item lock and Silent Lab's Basic-Ability suppression cannot continue to suppress Shuppet via that Silent Lab while PokéStop's Stadium effect is active. The theoretical six-effective-donor Silent Lab window must not be combined mechanically with simultaneous PokéStop dumping. A source player may subsequently replace PokéStop and reinstate Silent Lab, so even the restored eight-donor state is contingent.

## Exact conditional nonreplacement sample: four-donor break point

Fix a live 47-card deck after the physical setup hand and six Prize cards, containing **all eight** Hide 'n' Sneak donors. Assume zero already in discard, PokéStop is in play uninterrupted, no opponent alters the top-card order or replaces the Stadium, and each owner's turn includes one mandatory draw before a three-card PokéStop use. Since all card orders are uniform, the number of HNS donors in all PokéStop discard positions after U uses follows a hypergeometric distribution with population **47**, eligible copies **8**, sampled positions **3U**. Mandatory draw positions are excluded as discard opportunities. This is an *optimistic conditional deck-state reference*, not a prediction of when the Stadium can be obtained or how many turns a lock lasts.

| Uninterrupted PokéStop uses | Donor-card positions dumped | Exact chance >=4 of 8 donors dumped |
| ---: | ---: | ---: |
| 1 | 3 | 0% |
| 2 | 6 | **0.50367062%** |
| 3 | 9 | **3.31493291%** |
| 4 | 12 | **10.07444106%** |

The exact fraction is the sum over k at least 4 of C(8,k) × C(39,3U-k) divided by C(47,3U). These numbers do not include the chance of having the Stadium, starting with a Dhelmise, having usable Psychic Energy, maintaining a 47-card deck, preventing Stadium replacement, retaining access to the attackers, defeating an opposing lock Pokémon or claiming Prize cards. If even one donor is already discarded before the lock, the remaining threshold changes dramatically. In smaller or thinned deck states the relevant probability also changes. The precise 47-card/eight-donor reference therefore is **not a universal upper bound**.

Four uninterrupted uses require multiple owner turns, while some sources can attack or disrupt throughout. The useful finding is a timing and channel constraint: a post-lock rescue based solely on one random three-card Stadium effect cannot be assumed equivalent to the much faster directly selected Compressor/Blender discard line. A naive associativity graph treating the Stadium as another four-donor connector would overvalue it.

## Reproducibility and qualification

The [bounded calculator](../../scripts/agent25-vileplume-pokestop-postlock-screen.cjs) imports the existing BigInt binomial kernel and reads the original source/candidate manifests. [Five independent tests](../../tests/agent25-vileplume-pokestop-postlock-screen.test.cjs) verify exact Vileplume/Stoutland/Silent Lab printings, candidate Item counts, printed card text, four reference probabilities, and brute-force reduced-card donor position enumerations. All passed in existing **manual-only** [field threat CI 41588783691](https://github.com/FlareZ123/experiment-01/actions/runs/41588783691), compiled Node 22 on head 778670e995da45953bd25a8c5e83179ab54c838f. No push-triggered workflow was introduced.

**Recommended decision gate:** Before spending more full native compute on Dhelmise v2, preregister a source rank2/15 **actual selected Item-lock root**, the candidate's **pre-lock paid donor discard** or genuine PokéStop fallback, the opponent's meaningful continuation and all failed/capped attempts, on the unchanged original physical sixties. Both first-player seats and owner-only decision visibility are required. An engine terminal or this probability screen does not justify promoting v2 as the final fixed-60 benchmark deck.


## Subsequent genuine Store constraint validation, 3 November

The prepared original-source lock boards were exercised in the actual pinned Store with both candidate seats, and all ten native controls were retained. [Detailed reproducible native finding](../twinleaf/agent25-vileplume-stadium-rejected-root-store-contamination-20261103.md); [manual CI 41590900592](https://github.com/FlareZ123/experiment-01/actions/runs/41590900592). The six clean-Store controls successfully played PokéStop even with Vileplume Item lock and with rank-2 Stoutland in Active, and rank-15 clean Store controls really displaced Silent Lab and restored discarded Shuppet's Ability. Four arms that deliberately first attempted an illegal Battle Compressor and caught the native rejection silently failed to play the subsequently legal Stadium. **This is a Store error-recovery artifact and a reason to abort invalid-action samples, not a Pokémon paper rule.** Neither the random discard effect nor full matches were validated by these staged controls. No competitive game was qualified.
