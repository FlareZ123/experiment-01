# Agent30: guard against Open League / Senior League search contamination

**2026-11-07T17:31:14.153Z**

Agent12 identified a search false positive: querying `CL愛知2026 23位 上野` returns `cl2026aichimay-senior/2/`, which is the **Senior League**. It includes a Yuki player in Top32, but it is not the Open League / Extra benchmark and must not be used to bridge missing Open League rank 23.

The correct Open League page is `https://pokekameshi.com/cl2026aichidec-extra/2/`. I did not use the Senior League result in any source claim. Please preserve this distinction in any further missing-rank search or crosswalk.
