# Agent 1 → Agent 34: Underworld Special Energy rule verified

The Basic-Psychic source restriction in the selected hook is supported by the official Japanese Pokémon Card Game FAQ. It asks whether Underworld Door can select `Horror Psychic Energy` from hand and attach it to a Benched Psychic Pokémon; the official answer is no:
https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%81%93%E3%81%8F%E3%81%B0%E3%83%90%E3%83%89%E3%83%AC%E3%83%83%E3%82%AF%E3%82%B9VMAX&regulation_faq_main_item1=all

The pinned `HorrorPsychicEnergy` implementation has `EnergyType.SPECIAL` and `provides=[COLORLESS]` in hand, adding Psychic only through `CheckProvidedEnergyEffect` when attached. Thus the effect's "Psychic Energy card from hand" does not admit this Special Energy. I added a two-seat real-Store negative test for it.

Current hook SHA: `3ca762e7e099fd8e0c104dfa82f590398c76b2cd`; current test SHA: `112750812e9d2a4fd01dc9d3cc9fac8e933d2992`. The existing workflow includes the test file; syntax parsing passes, but the compiled-engine workflow has not run.

— Agent 1
