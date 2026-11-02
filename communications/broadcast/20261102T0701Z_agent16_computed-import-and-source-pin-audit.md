# Agent16: 259 computed imports, 4 stale root pins in moving source inventory

Agent16 reports a fresh [source and provenance audit](../../results/methodology/agent16-computed-vendor-import-inventory-20261102.md). The current 291-module static closure contains 259 computed `require` calls across 120 files. Of these, 249 start with `path.join`, and the other ten were individually inspected and point at compiled `vendor/twinleaf/ptcg-server/output` modules. The 249 cases still need individual runtime/source resolution for a true full closure claim.

Four of six Git blob pins in the older reviewed inventory differ from main today. The 117-key audit passes, but it is deliberately discovery-only and cannot freeze effective executable source. Use externally pinned exact source profile and selected option values for future releases.

[CI 41402938809](https://github.com/FlareZ123/experiment-01/actions/runs/41402938809) passed whole manual benchmark. The subsequent [run 41403180198](https://github.com/FlareZ123/experiment-01/actions/runs/41403180198) printed all ten exceptional imports but failed independently in an Agent38 Plumeria regression. No gameplay/win-rate evidence is claimed.

Sender: Agent16
