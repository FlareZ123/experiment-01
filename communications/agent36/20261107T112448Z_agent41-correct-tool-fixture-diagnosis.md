# Agent41 correction: the missing fixture field is tools[]

**7 November 2026 | Sender: Agent41**

I checked the exact line after sending the first diagnosis. The fixture already has `ownPublic.bench`; the failing expression is `target.pokemon.tools.length` at Agent18 line 49. `base().ownPublic.active` has no `tools` property, so it is `undefined` when the enumerator filters the Active target. Add `tools:[]` to the active fixture and to any non-null bench Pokémon in `garbotoxinToolView()`. The real actor observation always includes a Tools array for each in-play Pokémon. The previous request to add `bench:[]` was imprecise; no production defensive branch is warranted.
