# Agent 7: the root93 Secret Box → Escape Rope → Powerglass paper line

**7 November 2026, 05:16 UTC | original Aichi rank11 source seat0 vs unchanged New Moon candidate seat1 | retrospective, conditional paper opportunity.** This is an independently reconstructed alternative to the candidate's first repeated Pass at global turn14, root93, in the historical 209-root v9 native terminal. It has **not** been selected by the native bot, Store-executed, or demonstrated strategically superior.

## Frozen physical provenance and independent checks

Read-only evidence source A: [native CI 42332015390](https://github.com/FlareZ123/experiment-01/actions/runs/42332015390), artifact 13558301530, extracted `issue25-common-v9.json` SHA256 `ad78b652d48015329109ac333f4401b1e44458b8b8f66d79a6d24d9c839c676f`. Source B: [retrospective Lillie native CI 42333343834](https://github.com/FlareZ123/experiment-01/actions/runs/42333343834), artifact 13558074462, extracted SHA256 `7c9c95e37cf9c466d87e053f8ed481844d7acdbc54a619415e8a9d8ab8e5d659`. Both are actual original two-seat native Store archives, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

Both have original trial `11:1000:B:new-moon-lockbreaker-v1`, source deal SHA256 `a6e4ba442cc784498de9d2938b47e8e42b6e9591fc07558e505ac2cd9094b317`, and full physical deal SHA256 `94526e4b7eecefa78cbb7db5bc053cb593e90d20310a680e6510a00c11e702d7`. A's 209 accepted root ledger SHA256 is `696c0f66624c5ee51026f0d006ce80e8ca9e48dcc435c338f5b6617231d75176`. Original A and B accepted root objects **0–92 match exactly**, and at root93 A chose Pass while B actually played Lillie's Determination. The [read-only invariant-checker](../../simulation/evaluation/agent7-v9-root93-powerglass-opportunity.cjs) passed against both extracted archives with Node22; it refuses changed physical deals, changed prefix, missing payment, wrong owner seat, changed board, absent Basic Energy history or missing later Escape Rope residency witness.

## Why this particular Pass has a stronger, different candidate line

A's root93 authenticated **candidate-owned ten-card hand**:

`Battle VIP Pass FST, Secret Box TWM, Rescue Carrier EVS, Powerglass SFA, Lillie's Determination M1L, Rescue Carrier EVS, Battle VIP Pass FST, Lillie's Determination M1L, Forest Seal Stone SIT, Mysterious Treasure FLI.`

The candidate's Active is zero-Energy **Unown AOR**, with four Benched Pokémon, including an untooled zero-Energy **Mewtwo & Mew-GX UNM**. Opponent Active is **Trubbish FST** with three Basic Darkness Energy, and the opponent has five Benched Pokémon. There is no Stadium in play and the printed visible board is devoid of Item/Tool-lock cards. These are actor hand and public-board facts; opponent hidden zones were not used.

At root86, the source's settled **Super Poison Breath** attack took one Prize (source remaining 6→5) against candidate Active **Unown AOR** carrying **two physically attached Basic Psychic Energy**. Their earlier accepted attachment roots were 25 and 38. The normal Pokémon Knock Out rules put those attached Energies into the *candidate's* discard. This is a rules-derived discard location, not a separate physical object-ID discard audit. The candidate already had zero Energy on its entire board and zero Energy in its hand at root93. The archived first seven candidate attacks all occurred before this Pass; no additional candidate attack followed until global turn40 in A.

There is retrospective evidence that **Escape Rope BST was in the deck and unprized at root93**, despite being absent from the held ten cards: in same-deal B, Lillie at root93 settled its genuine ShuffleDeckPrompt at root95, followed only by benching Squawkabilly ex at root97; the candidate's actual owner hand at root98 included Escape Rope. The candidate did not gain a Prize or use an Item-recovery/search root during this interval. On the fixed initial physical deal, Escape Rope therefore belonged to the searchable deck at root93. This does **not** imply that the unobserved future shuffle in an alternative policy produces the same hand.

### Conditional printed-paper sequence to put one Basic Psychic on Mewtwo before the next turn

1. Play held **Secret Box**, paying its exact required three *other* cards by discarding the **two post-first-turn dead Battle VIP Passes plus one of the two Rescue Carrier copies**. One Rescue Carrier remains. Each physical card is in the actual owner hand at the decision.
2. Use its type-limited deck search to take **Escape Rope BST**. The Advanced Player's Rulebook section **H. Deck** permits choosing fewer cards from a search restricted by card types. Other search categories may be declined or resolved according to actual stock and the card's instructions.
3. Attach the already-held **Powerglass SFA** to the untooled **Benched Mewtwo & Mew-GX UNM**. One Tool per Pokémon remains respected.
4. Play **Escape Rope**. The opponent must choose its own switch first; the candidate then chooses the Benched Mewtwo as its new Active. Both sides have nonempty Benches, so this line does not require paying Unown's retreat cost.
5. End the turn, including if no attack was announced. With Powerglass attached to Active Mewtwo and at least one Basic Psychic in own discard, resolve its optional **end-of-turn** Basic Energy attachment. Advanced Player's Rulebook **E-21** specifically explains that Powerglass still works on a turn ended without attacking.

The rules establish a **plausible direct Energy recovery** where the already-run B Lillie merely refreshed a hand and produced no further attacks. This is not a guarantee of an eventual three-Energy Night Watch or any damage. The alternative spends the only ACE SPEC, one Powerglass, a Rescue Carrier, and Escape Rope. The opponent may respond with retreat, gust, Tool removal, targeted KO, control or other tactics. A 270-HP three-Prize Mewtwo Active also creates a major Prize-risk tradeoff.

## Concrete integration and falsification contract

- Use the existing **shared owner-only bilateral policy** and the exact above root93 physical prefix; Agent36 remains steward. Avoid new rank-specific production bot behavior. The generic decision question is whether an owner-visible combination of a payable search Item, a held Energy-recovery Tool, a legal switch and Basic Energy in own discard dominates an otherwise passive turn.
- Execute **A/B/A'** in real pinned Store, with actual root93 selection and Secret Box's three *physical* discard objects, search prompt and Escape Rope's opponent-first switching. Validate Tool attachment and the genuine Powerglass end-turn `AttachEnergyPrompt` plus resulting source discard→Active Energy movement. Document every failed/rejected/capped arm. The [existing staged paper E-21 native contract](../../simulation/twinleaf/agent41-powerglass-after-pass-native.cjs) and [owner-only prompt adapter](../../simulation/twinleaf/agent41-owner-powerglass-attach-prompt.cjs) can be reused after checking the exact unmodified scenario; neither proves this combined line.
- Compare first downstream opponent response, candidate next-turn attack funding and full Prize trajectory. Preserve unchanged original/candidate 60s and physical manifests. Consider direct route failure when Rope was searched but the opponent's promotion or source replies make the new position worse. Do not score an accepted Secret Box or Tool as a useful attack episode unless payoff and counterplay are witnessed.
- Do not promote this after-exposure opportunity or any resulting native winner to a prospective competitive sample; independently qualify paper acceptance, actor information sets, both-sided decisions, Japanese printings and official tournament clock.

This diagnosis is narrower than a generalized assertion that the shared baseline Pass was irrational. It identifies **one paper-plausible, fully specified alternative sequence**, anchored to an actual owner hand, identical deal and later native card-residency witness. It remains open whether it is the best play.

**Benchmark status unchanged:** 29/32 authenticated original card-name/count sixties (ranks23/25/28 absent), zero competitively qualified games, no nominated final unchanged 60 and no demonstrated 99.5% field win rate.
