# Agent 45: constrained K1 reconstruction of three paid Guzma & Hala search names

**6 November 2026 | Cross-report deduction, checked against the authenticated original rank-6 inventory and the frozen native owner policy.** This is a conditional reconstruction of historical native events, with no new Store execution. There are still zero competitively qualified games and no demonstrated win-rate improvement.

## Identical identified search triple in two distinct source trials

Under the explicit assumptions detailed below, the cards retrieved from the actual original rank-6 paid Guzma & Hala searches were:

| Search category | Inferred native printing | Why the category is identified |
| --- | --- | --- |
| Stadium | **Thunder Mountain Prism Star LOT** | Independent owner-hand witness found it after G&H; before-search original source hand lacked it |
| Special Energy | **Double Colorless Energy SUM** | Independent owner-hand witness found it before the native DCE attachment; before-search original source hand lacked it |
| Pokémon Tool | **Handheld Fan TWM** | It is the **only** Tool in original rank-6's 60 that is among Agent45's actual search selector's five Tool preferences |

The two separate native registrations are `6:101:B:champion-reference` (source seat 0, G&H root 22, DCE root 29) and `6:101:B:new-moon-lockbreaker-v1` (source seat 0, G&H root 29, DCE root 36), both global turn 2. In each, the original paid G&H mode selected two physically discarded source singletons (`Tool Jammer BST` and `Team Rocket's Handiwork FCO`) and moved **three actual cards** from its deck into its hand. [Original v9 receipt](agent45-issue25-ghala-relaxed-payment-v9-20261105.md) identifies three physical moves per target and all eight retained native outcomes. [Independent physical DCE and hand audit](agent5-v9-rank6-physical-dce-thunder-attack-opportunity-20261105.md) identifies the exact post-search, pre-attachment hand in both trials; the New Moon hand is the champion hand plus `Echoing Horn CRE`.

## Closed-world source and printed-rule reasoning

The authentic original rank-6 source is `results/aichi-2026/full-decklists.json` (60 physical copies). The frozen genuine prompt selector is [`agent45-owner-ghala-after-tagcall.cjs`](../../simulation/twinleaf/agent45-owner-ghala-after-tagcall.cjs). The source `cards/en/sm12.json`, printing `sm12-193`, states that Guzma & Hala searches for a Stadium and, after an optional two-other-card discard, may also search for a Tool and a Special Energy. The native policy constructs **at most one preferred card from each of those three categories**, then has the genuine prompt validate the selection.

Static intersection of that policy's exact named preference arrays with the original rank-6 deck is:

| Category | Preferred source cards originally in the 60 |
| --- | --- |
| Stadium | Thunder Mountain Prism Star LOT ×1; Wondrous Labyrinth Prism Star TEU ×1 |
| Special Energy | Double Colorless Energy SUM ×1; Speed Lightning Energy RCL ×4 |
| Tool | Handheld Fan TWM ×1 |

The Tool category is unique. Three native owner-deck transfers imply all three categories were selected in each historical paid branch. With no intervening owner-hand acquisition, the independently observed **previously absent Thunder Mountain and DCE now both in hand** uniquely identify the Stadium and Special Energy transfers. The one possible preferred Tool is Handheld Fan. This inference does not depend on looking at concealed opponent cards or knowing which of the six Prize cards held unrelated cards.

## Repeatability and falsification

- Reproducible pure script: [`scripts/agent45-rank6-ghala-k1-closure.cjs`](../../scripts/agent45-rank6-ghala-k1-closure.cjs). It imports the live original 60 and frozen selector lists, treats the actual two post-search hand inventories separately, and returns each conditional triple.
- Eight negative/positive regression tests: [`tests/agent45-rank6-ghala-k1-closure.test.cjs`](../../tests/agent45-rank6-ghala-k1-closure.test.cjs). **Eight of eight passed locally on Node 22**, covering original 60 length, normalizing the Prism Star label, physical three-card count, original source-Tool uniqueness, Stadium and Energy presearch absence, and the no-intervening-acquisition assumption. No GitHub Actions CI run of this new proof has been completed.
- The rank-6 source intersection was separately recomputed against the current GitHub JSON, returning a complete 60, 2 preferred Stadium names, 2 preferred Special Energy names, and 1 preferred Tool name.

**Important boundary:** The historical v9 archive did not record each selected K1 printed-name result directly. The proof relies on the Agent5 pre-search-hand absence witness, full post-search owner-hand receipt, actual three physical transfers, and the absence of any other hand gain between the G&H search and the observed hand. That last condition is explicit in the checker; it has not been independently replayed against every intermediate Store card-identity transition in this report. Accordingly the three names are a **high-confidence conditional cross-report reconstruction**, rather than a newly authenticated, direct K1 prompt receipt. A future native Store observer should write `selectedPrintings` and physical object IDs at the genuine owner prompt, with root ordinal, to upgrade the certificate.

**Gameplay boundary:** The separate v10 trial later genuinely played Thunder Mountain and used Volt Cyclone to deal 140, moved the sole DCE to the source Bench, and observed a weak opponent response. That does not demonstrate the two singleton discards were strategically best, that the original source policy is competitive, or that any complete game was qualified. [v10 native payoff report](agent36-v10-rank6-settled-volt-reply-20261105.md). The fixed-deck benchmark remains 29/32 authenticated opponent compositions with ranks 23/25/28 missing, zero qualified games, no final selected 60, and no 99.5% proof.
