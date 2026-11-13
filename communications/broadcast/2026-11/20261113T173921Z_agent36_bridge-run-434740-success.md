# Agent 36: owner-dispatched pinned Twinleaf Aichi bridge succeeded

The previously blocked bridge now has a successful owner-dispatched GitHub Actions run.

- Workflow run: [43474022988](https://github.com/FlareZ123/experiment-01/actions/runs/43474022988), `workflow_dispatch`, actor `vv12x`, branch `main`, research revision `0b6b58f7316fa5e66439d265c64aa20f200cc791`.
- Pinned Twinleaf gitlink: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- The `aichi-bridge` job completed successfully. The job checked out the pinned submodule, installed dependencies, compiled Twinleaf, ran the bridge regression tests, and mapped the frozen source artifact through CardManager.
- Downloaded artifact: [aichi-twinleaf-decklist-bridge.zip](https://github.com/FlareZ123/experiment-01/actions/runs/43474022988/artifacts/14062311379), artifact ID `14062311379`; ZIP SHA-256 `6af623d6ec694a6b707973e45f503d88ccad737ce9f014371c442a834321de`.
- Artifact result: `status=complete`, 812/812 source rows resolved, 1,440/1,440 card copies, 24/24 registered 60-card decks, zero unresolved rows. Input audit SHA-256 `6ac2fbaec602f7c9ffd49c2a90c4c79be78df696cc56decc3631f5ad50c1812b`; normalized field SHA-256 `fba71e372f7e25b174473dc4c22ce2db90ae404a30d9ca14383816ecf94ca7c2`. Rank-1 registered multiset hash matches the local bridge report: `9d061043904d0d824c7cbd76f72c0b98858c6f203621ab24b38af23025475bcd`.
- All six Night Stretcher ASC/196 copies in ranks 1, 8, 19 and 22 resolved directly to Twinleaf ASC/196; the SFA/61 fallback was not used.
- The artifact is explicitly `diagnostic_only=true`, `paper_admission_eligible=false`, `competitive_admission_eligible=false`. It covers only the 24 identity-screened diagnostic reconstructions: five Japanese-Extra-only lists and three unavailable lists remain outside the panel; physical-copy proof remains 0/32. This does not qualify any competitive matchup or support a win-rate claim.
- This supersedes the earlier statement that a new bridge dispatch was still needed and supersedes the pre-mapping failure in run `43468088132`. Agent3's test-import correction was exercised successfully by this run.

Next: preserve the artifact and update the human-facing status. The separate encrypted Agent36 owner fixture workflow is still not dispatched; it requires the public Actions variable `AGENT36_DIAGNOSTIC_PUBLIC_KEY_PEM`. The local Agent49 fixture report is diagnostic-only and its full trace remains in private scratch; request/produce an owner-controlled encrypted trace before policy iteration.
