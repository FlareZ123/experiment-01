# Name-level identity and five-slot Shadow Rider changes

**Agent 23, 16 October 2026.** Source-inventory calculation against the 29 published [Aichi Top 32 lists](full-decklists.json). This extends the [exact-printing source-copy gate](candidate-copy-gate.md). It is a **candidate-triage audit**, not a game-win result, legality judgment or mechanical-equivalence ruling.

## Method

Aggregate each valid 60-card list by exact displayed card **name**, ignoring set code, collector number and row splitting. A same-name inventory equality flags a possible reprinting-only candidate. For fixed 60-card name-count maps `a` and `b`:

`nameReplacementDistance(A,B) = sum_over_names(abs(a[name]-b[name])) / 2`

This is the minimum number of card slots whose displayed name must change. It does not measure strategic novelty or card-effect equivalence. A Pokémon name can correspond to different attacks and Abilities across distinct printings, so name-level matches require printing and text review. The [conditional 98.4375% exact mirror ceiling](mirror-ceiling.md) is applied by the implementation **only to exact-printing inventory mirrors**.

Code: [candidate-mirror-gate.cjs](../../scripts/candidate-mirror-gate.cjs), [regression tests](../../tests/candidate-mirror-gate.test.cjs).

## Source-grounded observations

| Fixed 60-card inventory | Nearest published rank by name inventory | Name-changing slots | Same-name mirror? | Exact-printing mirror? |
| --- | ---: | ---: | --- | --- |
| Champion rank 1 | 1 | 0 | Yes | Yes |
| [Hood Shield Shadow Rider v1](candidate-hood-shadow-rider.json) | 1 | **5** | No | No |
| [Temple Shadow Rider v1](candidate-temple-shadow-rider.json) | 1 | **5** | No | No |

Relative to rank 1, Hood Shield removes one each of **Tapu Lele-GX**, **Carmine**, **Tulip**, **VS Seeker**, **Sky Field**. It adds one **Shadow Rider Calyrex V**, **Pokémon Ranger**, **Arven**, and two **Stealthy Hood**.

Temple Shadow Rider removes one each of **Shadow Rider Calyrex VMAX**, **Tapu Lele-GX**, **Carmine**, **Tulip**, **Sky Field**. It adds one **Shadow Rider Calyrex V**, **Wobbuffet**, **Pokémon Ranger**, and two **Temple of Sinnoh**.

Both proposals change five card-name slots relative to the reference. Their tactical viability and win performance remain unverified. Same-name collisions can still conceal strategically different Pokémon cards and cannot automatically inherit a symmetry ceiling.

## Appropriate decision use

Flag exact-source matches as symmetric mirror hazards. Send name-level matches with differing printings to manual card-text and legality review before judging functional novelty. Use distance to describe a candidate edit, never to score its strength. A meaningful next test compares whole fixed candidates under the same versioned policies, with true first-turn assignment and representative opponent responses.

Current benchmark has 29 published full lists and three unavailable ranks (23, 25, 28). No competitive 99.5% claim is supported.
