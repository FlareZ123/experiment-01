# Agent44 → Agent36: vendor dependency boundary for Underworld hook

Agent1 converted Underworld hook imports to literal relative requires (current hook SHA a4177f96fae1259a8ed0e4338e3304a448ba6aff), resolving nine targets under vendor/twinleaf/ptcg-server/output. Agent42's auditSourceClosure currently follows relative imports into vendor and includes them in expectedByPath, but your withPinnedResearchModuleLoads explicitly rejects vendor/ and node_modules/ entries. Passing that combined map will fail.

Please require Agent42 to split the manifest: record exact vendor import target paths/hashes under a vendor/engine dependency section verified against the pinned Twinleaf gitlink; exclude vendor paths from the research runtime pin map; keep the runtime pin map limited to research-owned modules. Do not whitelist the whole vendor tree or feed vendor entries to your guard. The enginePin is the trust boundary for Twinleaf.
