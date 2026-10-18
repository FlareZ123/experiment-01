# Secret Box to Field Blower to copied Horror House-GX: conditioned Store witness

**Agent 1, 18 October 2026. Evidence: actual compiled pinned-engine actions on a staged hand and board. No source-dealt 60-card matchup, competitive win or qualified game.**

## Mechanism and frozen source

New Moon Lockbreaker v1 has one Secret Box, two Field Blower, two Powerglass, two Mewtwo & Mew-GX, one Gengar & Mimikyu-GX, three Basic Psychic Energy and three Telepathic Psychic Energy. The English proxy 60 uses SHA-256 a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4. [Frozen complete list](new-moon-lockbreak-60-candidate.md).

Secret Box requires discarding three other hand cards, then searches one Item, one Pokémon Tool, one Supporter and one Stadium. The test asks whether those costs can simultaneously supply a Perfection attack payload and a reserve Basic Energy, while the searched Blower removes Garbotoxin and the searched Powerglass accelerates after the copied attack. It measures a *conditional legal sequence*.

## Deliberately favorable setup

The candidate's Active Mewtwo & Mew-GX UNM starts with one Basic Psychic Energy attached, no Tool. Opponent has Pidgey MEW Active and Garbodor BKP with Float Stone BKT on the Bench, blocking Perfection. Both have decks and six Prizes. It is turn four.

The candidate has Secret Box, Gengar & Mimikyu-GX, a separate Basic Psychic Energy and Canceling Cologne in hand. The last three are intended Secret Box payments. The deck contains available Field Blower GRI, Powerglass SFA, Lillie's Determination M1L and Sky Field ROS. **Every one of these opening positions and search targets was injected.** No natural opening rate follows.

## Executed pinned Store timeline

1. Secret Box is played as a real Item. Its ChooseCardsPrompt requests exactly three cards. Gengar, Basic Psychic Energy and Canceling Cologne are selected and physically enter the candidate discard. The three-card payment uses the pinned temporary hand collection with the original card references.
2. The next ChooseCardsPrompt searches the four separate Trainer classes and legally selects Field Blower, Powerglass, Lillie's Determination and Sky Field. These enter the actual hand. The engine resolves card reveal and shuffle. Garbodor still retains Float Stone, and Perfection remains blocked.
3. Searched Field Blower is played. Its real ChoosePokemonPrompt targets Garbodor. Float Stone goes to opponent discard, Field Blower goes to candidate discard, and a CheckPokemonPowersEffect now verifies **Perfection is available**.
4. The searched Powerglass attaches to Active Mewtwo. The player uses the genuine Perfection Ability, resolves its WaitPrompt, and chooses **Horror House-GX from Gengar & Mimikyu-GX discarded by Secret Box** in the live ChooseAttackPrompt. It resolves, spends the GX allowance and establishes the opponent hand-play lock. Exactly one Psychic Energy remains attached at attack resolution.
5. The genuine end-of-turn AttachEnergyPrompt for Powerglass accepts **the same physical Basic Psychic Energy paid to Secret Box**. Mewtwo finishes with two Energy attached, and the reserve has left the discard pile. The opponent hand-play restriction remains observed.

The initial board and search contents are staged. After staging, the card discards, searches, Tool removal, Ability use, copied GX attack and attached Energy all come from real engine actions and validated prompt resolutions. A control run confirms the four-category Box search, Field Blower removal and Perfection restoration without the copied-attack extension.

## Reproducible source and runs

- Research-owned runner: [simulation/twinleaf/newmoon-secretbox-fieldblower-live-line.cjs](../../simulation/twinleaf/newmoon-secretbox-fieldblower-live-line.cjs), default run for the Blower control and run with bridgeToHorrorHouse:true for the full copied-GX line.
- [Manual compiled CI run 39139341190](https://github.com/FlareZ123/experiment-01/actions/runs/39139341190), research revision 074218839e84f86b2f81a501e9a301b20858a00e, Twinleaf pinned a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The three Secret Box inspection, Blower control, and copied GX / Powerglass steps **all passed individually**.
- [Blower control artifact 12141320944](https://github.com/FlareZ123/experiment-01/actions/runs/39139341190/artifacts/12141320944), ZIP SHA-256 fc958bd7baa223005d083c190184c1777bb8373de035e3a010ba7d3e13a0cf4c.
- [Copied GX / Powerglass artifact 12140684229](https://github.com/FlareZ123/experiment-01/actions/runs/39139341190/artifacts/12140684229), ZIP SHA-256 d834876fd2eddb47c79b8e807936c383a2cafe62ff4f5a89f21f559161413a0e.
- **Overall workflow FAILED** on a later, unrelated rank-15 Vileplume test, which requested Will-O-Wisp but the pinned Dusclops SFA source spells its attack Will-o-Wisp. The mismatch was communicated to Agent30. This report calls only the relevant Secret Box stages green.

## Strategic significance and failure gates

This proves a multi-axis attack line may be constructed through Secret Box: paying Gengar and Basic Energy is productive when the same card also finds Blower, Powerglass and the next-turn Supporter. The third payment was **Canceling Cologne**, potentially a strategically protected counter against Iron Thorns or Klefki. Burning it could be catastrophic in a different state. Playing Secret Box on this route also excludes alternative uses of the same ACE SPEC and search channels.

The list has only one Secret Box and one Gengar, limited Basic Psychic Energy and Mewtwo copies. A previous [exact discardability sensitivity](new-moon-secret-box-discardability-frontier.md) found that the Box-to-Blower search increment varies drastically with the number of genuinely acceptable three-card payments. A separate stricter first-eight resource-co-visibility model is being tested; other card draw or search routes may solve some missing pieces at independent costs.

The constructed opposing Pidgey and preattached Garbodor do not represent source-dealt rank-11 policy. An opposing replacement Tool could restore Garbotoxin, and Horror House does not prohibit an already powered attacker from attacking. No candidate copied attack against an actual 32-field opponent or opponent strategic response was evaluated.

**Status: 29/32 exact source opponent lists known, zero competitively qualified games, no demonstrated 99.5% win rate.** Do not promote this hypothetical staged mechanical success into a competitive win estimate.

## Decisive follow-up

Use authentic rank-11 source deals with both starting seats, own-hand K0 information, and legal owner deck-search K1 transitions. Have a frozen autonomous candidate policy choose among Secret Box discard payments and other connectors, and record subsequent Gengar attack conversion and opponent retooling. Capture missed attacking windows and invalid actions as negative evidence.
