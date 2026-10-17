# Aichi champion's actual strategic design: research priors and policy acceptance cases

**Agent 8, 17 October 2026.** Human-source evidence from the champion and a deck-building teammate, separated from simulator evidence and observed win rates.

## Provenance

- [AriPoke, Toreca Camp Media, 16 May 2026](https://torecacampmedia.com/%E3%80%90cl2026%E6%84%9B%E7%9F%A5may-%E3%82%A8%E3%82%AF%E3%82%B9%E3%83%88%E3%83%A9%E5%84%AA%E5%8B%9D%E3%80%91%E3%81%93%E3%81%8F%E3%81%B0%E3%83%90%E3%83%89%E3%83%AC%E3%83%83%E3%82%AF%E3%82%B9vmax/): a co-builder's first-person account of the same winning Shadow Rider Calyrex VMAX 60.
- [Yasunori, winner's article, 29 May 2026](https://note.com/yasunori_1028/n/n8eca50402c65): **public preview only**. The detailed remainder is paid and must not be inferred from the preview.
- [Pokémon official champion interview](https://www.pokemon-card.com/info/005499.html): identifies Kato Yasunori as Open League winner.
- [Rank-1 60-card reference](benchmark-shadow-rider.md) and [manifest](full-decklists.json) for the exact fixed deck.

The co-builder reports **his own tournament record was 2-3**, despite his teammate winning the tournament with the shared list. One champion outcome is insufficient to estimate repeatability or matchup win rates.

## Primary-source strategic evidence

### 1. Regidrago's counterattack requires a long temporal line

The builder explicitly designed **Mimikyu Copycat → opponent's Apex Dragon → own discard's Dialga-GX Timeless-GX**. Lillie's Clefairy ex uses **Fairy Zone** to make the opposing Dragon weak to Psychic; Mimikyu's copied Timeless-GX can therefore Knock Out a Dragon and grant an extra turn. For that extra turn, the builder cites copying **Radiant Eternatus Power Beam** for 200 from the discard pile, avoiding the inability to reuse spent Timeless-GX. Radiant Eternatus also provides early **Climactic Gate** to Bench two Pokémon VMAX, ending the turn.

The supplied card pool confirms Radiant Eternatus is Dragon with printed Power Beam 200 and Climactic Gate (cards/en/swsh12pt5.json), and Clefairy's Fairy Zone sets opposing Dragons' Weakness to Psychic x2 (cards/en/sv9.json).

**Implication:** a bot must preserve Mimikyu, Dialga-GX, Clefairy, the relevant discard payload and attacker Energy until the opponent exposes Apex. It must evaluate the entire copied-attack extra-turn sequence, not only a reachable Copycat choice. Correct spent-GX, attack history, discard destination, Weakness, extra-turn and Bench mechanics are prerequisites for sound simulation.

### 2. Fast setup and the two-Prize threshold

The team reports that **taking the first two Prize cards was often decisive against Regidrago**. They favored early Radiant Eternatus **Climactic Gate** over a slow Shadow Mist strategy. They retained **Carmine** for opening consistency, including **Fog Crystal → Tapu Lele-GX → Carmine**. They valued **Lillie's Determination** for progressing through the deck without discarding strategically protected combo cards.

They chose **Sky Field** over Temple of Sinnoh for Bench expansion, and for the later option of removing Sky Field so an excess Benched Pokémon such as Radiant Eternatus can enter the discard and become an Apex payload. They replaced Wobbuffet with a second Lillie's Clefairy ex. They wanted a second Guzma for first-Prize tempo, though the final list had one.

**Implication:** good policy must jointly optimize setup probability, Bench occupancy, deliberate discard transitions, protected combo pieces, Supporter contention, and early Prize tempo. Raw draw/setup proxies miss several intended decisions.

### 3. Alternate control plan and format-general weakness

The team documented **Unfair Stamp + Trevenant & Dusknoir-GX Night Watcher / Pale Moon-GX** as an alternative disruption mode.

The co-builder described **Mega Absol/Garbodor as almost unwinnable for their selected list** and said Mega Floette ex was considered during tuning. This is a first-hand matchup judgment, not a rigorously measured rate. It is strong reason to avoid promoting the champion unchanged as an all-field 99.5% solution without further evidence.

The champion's public article preview frames **90% against Regidrago, 60% against everything else** as his hoped-for strategic performance (not audited actual results). The co-builder reports six of the champion's eight Swiss rounds were against Regidrago. Success in that concentrated metagame may not transfer to a fixed, evenly evaluated 32-deck field with locks, mill and diverse power engines.

## Concrete test queue

1. **First-turn source-state Radiant Eternatus:** actual starting seat, access to VMAX targets, Supporter choice, Bench capacity and meaningful end-of-turn cost. Test actual Card effects, not general setup counts.
2. **Regidrago counter sequence:** reproduce a true exposed opponent Apex, Mimikyu Copycat, own discard's Dialga-GX, Fairy Zone, Timeless-GX, extra turn, spent-GX and Radiant Eternatus Power Beam follow-on, including exact Prizes and ability locks.
3. **Sky Field cleanup:** test the Bench-capacity and discard opportunity cost of stadium removal, and whether Radiant Eternatus's attack payload is actually accessible.
4. **Hard-matchup redesign:** investigate Mega Absol/Garbodor, Iron Thorns, Vileplume/Stoutland, and stall before claiming an all-field contender. Test structural options such as the builder's considered Mega Floette ex with legality and exact effect review first.
5. **Qualify evidence:** per-rank full source lists, version-pinned engine and policy, both actual starts, source-state replay, rule equivalence, imperfect-information fidelity, critical opponent decisions and independent review.

This document identifies **human design intent and testable hypotheses**. It does not endorse the player estimates as sampled probabilities or establish that the implementation correctly plays these combos. **Competitively qualified games remain zero.**
