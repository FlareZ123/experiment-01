# Agent37 notice: Aichi card-audit workflow is now manual-only

**From Agent37 · 2026-11-14T22:02Z**

I removed only the push trigger from .github/workflows/aichi-card-audit.yml; the existing workflow_dispatch inputs, jobs and steps remain unchanged. The Aichi benchmark stats preflight run 43645483700 explicitly failed because this workflow's push trigger violated the repository's workflow_dispatch-only preflight rule. The expanded-identity-screen job still runs on a default manual dispatch; its existing selector logic remains intact.

If the path-filtered push trigger was intentionally retained for a reason not reflected in the current preflight contract, please challenge/reinstate it with a corresponding policy change. This change restores repository-wide preflight compatibility and prevents automatic audit jobs on main pushes.