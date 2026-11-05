# Agent 5: the native paid G&H line actually reached a source-owned Double Colorless Energy play

**5 November 2026 | independent read-only audit of pre-existing compiled native results | development only.** The selected historical v5 original-source benchmark still has zero qualified competitive games. This report identifies a previously underreported **source-owned Energy-card root** in Agent45's published paid G&H v9 experiment, and pinpoints the remaining Thunder Mountain / attack-stage evidence gap.

## Exact input provenance

Downloaded **GitHub Actions [42080317659](https://github.com/FlareZ123/experiment-01/actions/runs/42080317659), artifact 13440970417** independently through the GitHub artifact API, then inspected both JSON members of the ZIP. Outer ZIP byte length **32,312**, SHA-256 `2f15f6eb6427607018c2758f0b4e7eb33281c2e84d6b3d50e194debb1eee695a`.

- `strict/issue25-steward-v5.json`: 149,306 bytes, SHA-256 `31737e3cebed34999661a2380fc7d740c7559a51f0b197e04f483f97a2562692`.
- `relaxed/issue25-steward-v5.json`: 150,407 bytes, SHA-256 `cc1d6d90df6fb4e12e30bd95e7e17c1cafddfd32709968fbbb2f8386bfd5d7aa`.

These hashes exactly match Agent45's [original v9 report](agent45-issue25-ghala-relaxed-payment-v9-20261105.md). Both archived source trial records have `publicRootActionsTruncated=false`, `publicRootLedgerDigestConsistent=true`, and their reported root-ledger SHA-256 equals the computed root-ledger SHA-256. Every observed root described here is in the archived **accepted Store root** sequence, rather than an off-Store action proposal.

## Same-deal strict versus paid branch

| Frozen original rank6 trial | Strict v8-like source after G&H | Relaxed v9 source after G&H | Exact initial full/source deal hashes agree? |
| --- | --- | --- | --- |
| `6:101:B:champion-reference`, source seat0, global turn2 | Accepted G&H Supporter root22, then free-option source Pass root28 | Accepted G&H root22, paid prompts, **PlayCardAction Double Colorless Energy at root29**, source Pass root30 | **Yes**, full `73366340afa6309d501589f80cf3fd732aebb7d0088d38e510781365f8384861`; source `04be1f33cf67365affd0c8b95c32b5346093f78ef21fc8a43a23febcac1e2fae` |
| `6:101:B:new-moon-lockbreaker-v1`, source seat0, global turn2 | Accepted G&H Supporter root29, then free-option source Pass root35 | Accepted G&H root29, paid prompts, **PlayCardAction Double Colorless Energy at root36**, source Pass root37 | **Yes**, full `86e4d2d417f403c864c0279bb6ed9955e7f133cc39f932cd7832d7dffc420c6c`; source `509bc6e44713a30eb38ddfd59efb20540f9f3a6cac37d9d9f4c19fe2adf0faee` |

In each relaxed trial the source actor previously played **Tag Call** (roots17/24), fetched Guzma & Hala through an authenticated owner-deck prompt, then physically played that Supporter (roots22/29). Agent45's separate native receipt already proves the subsequent optional **two-card payment** of singleton Tool Jammer BST and singleton Team Rocket's Handiwork FCO, followed by a genuine three-category owner search with three physical cards added to hand. The two independent accepted Energy roots above extend that evidence: each source actor then played **Double Colorless Energy**, a previously undocumented stage of this actual frozen source line.

The exact original rank6 paper sixty contains **one DCE**. At the matched pre-intervention owner source root17, Agent20's independently verified pre-choice snapshot lists all six held cards and shows **no DCE**, while both its Active and Bench Iron Thorns ex are unenergized. The Tag Call search targets TAG TEAM cards, so the intervening paid G&H category search is the identified route by which this DCE became available in the first trial. Agent35's independent original-v5 all-Pass owner census likewise records **no DCE in the second trial's seven-card owner hand** at the original source Pass24 (hand SHA-256 `d8156b8da66de2dabe4deab2951f65472f3ed8b812c5244a996eb3301fd3c330`). Its initial physical deal and pre-Tag-Call accepted source prefix match the registered v9 starting state. The second hand is a post-choice observation with pre-choice noninterference unverified, so an independent v9 owner-custody record would strengthen the inference that the G&H search obtained the DCE. **Both** earlier hands omit DCE, and neither actual source had a prior ordinary Energy play in those frozen turn2 branches.

## Precise evidence boundary and next test

`PlayCardAction` is an accepted **Energy-card play**, which strengthens the previously reported native G&H line. The public root receipt does **not** expose the Energy's exact physical recipient, attached-card zone after Store resolution, identity of the three G&H targets, or any printed attack settlement. Do not upgrade this to a **certified DCE attachment to Active Iron Thorns**, **Thunder Mountain in-play**, or **Volt Cyclone attack** without a separate post-Store owner-board and Energy-custody witness.

Neither relaxed source accepted-root stream shows a subsequent `PlayCardAction` for **Thunder Mountain ◇** or a source `AttackAction` by the original 48-root cap. The paper ALS described by [Agent18](agent18-original-rank6-root17-tagcall-dce-thunder-volt-als-20261105.md) needs a Lightning cost reduction, since DCE alone pays two Colorless requirements of Volt Cyclone's Lightning-plus-two-Colorless cost. The next high-yield native step is a **same-deal, source-owned, after-DCE physical attachment and Stadium provenance check**. Once board prerequisites are independently confirmed, attempt a fully accepted Volt Cyclone attack with mandatory Energy move and record a real opponent reply. Preserve both initial physical deals, existing paid prompts, all failures and censoring, and source actor's ordinary Stadium/attachment quotas. A source-independent policy improvement must also account for the two strategically valuable singleton payment cards sacrificed in the paid branch.

This finding corrects the **stage-of-execution accounting** without claiming an actual battle benefit. Original source games here remain seven 48-root caps and one engine error across eight registrations; no complete game, no field win-rate estimate, no selected final 60. The 29/32 original name/count admission remains unchanged.

### Independent reproduction

Read the two listed JSON members from archived artifact 13440970417; for the two exact `id` values above, verify the identical `fullPhysicalDealFingerprint` and `sourceDealFingerprint` in strict and relaxed files, `originalSourceSeat===0`, `publicRootLedgerDigestConsistent===true`, and the presence of a relaxed `publicRootActions` row with `playerSlot===0`, `turnBefore===2`, `action==='PlayCardAction'` and `card==='Double Colorless Energy'`. Verify that strict versions lack this same-turn DCE root. The original eight-attempt failure and cap denominator must remain intact.
