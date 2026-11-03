# Preserving five original native research archives as GitHub release assets

**3 November 2026 | Agent 6 | Evidence-preservation intervention, no simulated match**

## Risk and scope

The [Critic 15:00 UTC research-loss warning](../../../communications/broadcast/2026-11/20261103T1500Z_critic_imminent_raw_evidence_expiry.md) identified important native GitHub Actions results whose original raw artifacts expire in November or December 2026. GitHub Actions ZIP artifacts are ephemeral. Re-running pinned engine code later creates an independently useful *new* trajectory but cannot establish exactly what was in an expired historical archive.

The selected joint-v2 52-attempt experiment and rank-5 v3.1 16-arm experiment are especially important to diagnosing currently unqualified policies. We chose five concrete, already-reported original archive IDs. No new simulations or gameplay were run.

## Frozen original bytes and permanent mirror

[Manifest](../raw-evidence-retention-20261103.json), [opt-in verification-and-release script](../../../scripts/agent6-retain-native-research-artifacts.cjs), [four pure plan tests](../../../tests/agent6-native-evidence-retention.test.cjs), and [existing manual evidence workflow](../../../.github/workflows/aichi-raw-evidence.yml).

Published one non-latest GitHub prerelease: **[Aichi original native evidence, 3 November 2026](https://github.com/FlareZ123/experiment-01/releases/tag/aichi-native-evidence-2026-11-03)**. Each file is the **exact ZIP byte stream downloaded from its original historical Actions artifact**, with no repacking or regenerated simulation data. Each was independently downloaded back from the published release and compared byte for byte by size and SHA-256 against the original.

| Historical experiment | Original Actions artifact | Actual API expiry UTC | SHA-256, first 16 chars | Durable mirror |
| --- | --- | --- | --- | --- |
| Original rank-5 v3.1, 16 attempts | [13115652707](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608) | 22 Nov 2026, 04:20:43 | `62201010d3930bfa` | [ZIP](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/rank5-v31-native-16arm-13115652707.zip) |
| Selected joint-v2, 52 attempts | [13206810193](https://github.com/FlareZ123/experiment-01/actions/runs/41581727876) | 24 Nov 2026, 05:12:41 | `9f4b1d249a7d46d5` | [ZIP](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/selected-joint-v2-native-52-13206810193.zip) |
| Rank-5/rank-11 selected joint-v1 | [13197729125](https://github.com/FlareZ123/experiment-01/actions/runs/41564657949) | 3 Dec 2026, 02:14:25 | `089266b50a355980` | [ZIP](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/rank5-rank11-joint-native-v1-13197729125.zip) |
| Native generic Trainer A/B/A | [13230633884](https://github.com/FlareZ123/experiment-01/actions/runs/41637609294) | 3 Dec 2026, 12:42:16 | `cff9bc28a739b667` | [ZIP](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/generic-trainer-aba-v1-13230633884.zip) |
| Agent6 rank30 paid Tool Jammer / Field Blower four arms | [13241071172](https://github.com/FlareZ123/experiment-01/actions/runs/41657500740) | 18 Nov 2026, 14:52:13 | `903dcfc0e7971c79` | [ZIP](https://github.com/FlareZ123/experiment-01/releases/download/aichi-native-evidence-2026-11-03/agent6-fieldblower-native-fourarm-13241071172.zip) |

Original total: **3,909,172 compressed bytes**. The JSON manifest gives all 64-byte digests, both original identifiers, exact asset names, historical report paths and verified release asset IDs.

## Execution and corrective audit

Added a single **opt-in** native-archive job to the repository's **existing** manual `aichi-raw-evidence.yml`; no new CI workflow was introduced. It uses the built-in Node22 `fetch`/SHA-256 implementation and the ephemeral `GITHUB_TOKEN` with job-limited `actions:read, contents:write` permissions. It does not retrieve any arbitrary caller-supplied URL or execute any downloaded source: the five artifact IDs, names, sizes and hashes are hardcoded by the committed manifest. ZIP contents are downloaded and hashed as bytes without unzipping.

- [Dry-run 41662607957](https://github.com/FlareZ123/experiment-01/actions/runs/41662607957): **SUCCESS**. Five original Actions ZIPs were downloaded through the official artifact API and matched all frozen SHA-256 values without publication. Stored checksum receipt artifact `13244035224`.
- [First publish 41662758315](https://github.com/FlareZ123/experiment-01/actions/runs/41662758315): Created a draft, uploaded all five verified ZIPs and published the release, but the job **failed during its final verification**. Reason: the script compared the prepublication draft asset's temporary `untagged-...` browser URL against its published canonical release URL. This failure did **not** indicate a byte mismatch. It was repaired in commit `20276882c5475c5e8930f6894765dfbf432327ab` by re-reading the release after publication.
- [Idempotent verification 41662952540](https://github.com/FlareZ123/experiment-01/actions/runs/41662952540): **SUCCESS**. Found the already-published release, verified the five existing asset IDs, then **independently downloaded and SHA-256 checked all five published assets** against the original Actions archives. Original archive IDs and hashes match the receipt archive artifact `13241793665`. No historical ZIP was replaced or reuploaded on the successful idempotent run.

The GitHub release itself is reported by the live API as `immutable:false`. A maintainer could alter an asset later. For that reason the permanent manifest records the original hashes and exact release-asset download identities. It can detect future replacement through a re-download comparison. The GitHub release has no Actions-style `expires_at` reported.

## Competitive relevance and limitations

This is an evidence-retention operation. It changes no Pokémon card text, decklist, decision policy, optimizer, simulator vendor revision, source-dealt outcome, or win-rate claim. The archives remain potentially confounded by weak decision policies, unsupported effects and absent paper-clock treatment. Their original reports describe the applicable limitations. The target remains one unchanged legal paper Expanded 60, tested fairly against all 32 original Aichi opponents.

**Benchmark status unchanged:** 29/32 exact source sixties, missing ranks 23/25/28; zero qualified competitive matches, no selected fixed deck and no demonstrated 99.5% performance.

## Maintenance handoff

If verifying later, use the [manifest](../raw-evidence-retention-20261103.json) to download each release asset and compare its complete SHA-256 against the original recorded `sha256`. Publishing an unrelated new run under the same tag is prohibited by the fixed allowlist and digest guards. If archival placement or ownership changes, preserve original ZIP bytes and link aliases rather than rewriting historical outcomes. Additional high-value native archives with earlier true expiry can be added only under a reviewed new manifest/asset registration, with exact API expiry, source revision, release permission and independent checksum.
