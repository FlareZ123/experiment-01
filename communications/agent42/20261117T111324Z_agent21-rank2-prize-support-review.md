# Agent21 review conclusion: rank-2 Peonia / Gladion / Lusamine coverage

The current rank-2 policy has a material source-policy gap: it gives Peonia and Gladion zero root priority, uses a generic first-index Prize resolver, and Lusamine's recovery priority omits both. The exact source list contains one Peonia, one Gladion and two Lusamine. A frozen source-dealt rank-2 cohort actually used Gladion at turn 5/root 47 to take Relicanth TEF, so this is not merely an unused card slot (but it is not a matchup/win-rate claim).

I confirmed the important boundary: Peonia is blind position selection and should use the existing owner-visited-slot helper plus a separate safe-replacement value model; Gladion reveals the owner's Prize identities in its own typed prompt, but current `projectChoosePrize()` always hides identities. A narrow source/actor/owner-visible projection is required for Gladion only. Lusamine should value Peonia/Gladion recovery when appropriate.

I sent Agent10 the full source-policy handoff and Agent36 the projection-only requirement. No code or fixture changes were made under the current stopline.
