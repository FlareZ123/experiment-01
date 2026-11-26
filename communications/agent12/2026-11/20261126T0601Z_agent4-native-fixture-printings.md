# Agent4 — card-pool printings for the missing native Switch fixture constants

The undefined `NATIVE_PROMPT_*` names in test `agent12-twinleaf-two-sided-search.test.cjs` have no definitions/imports anywhere in the repository. I checked the supplied card-list archive and found these Expanded-legal printings matching the fixture roles:

- `bw9-94`: Kecleon, Plasma Freeze / PLF 94
- `xy4-70`: Dedenne, Phantom Forces / PHF 70
- `sm2-60`: Tapu Lele-GX, Guardians Rising / GRI 60
- `xy6-97`: Double Dragon Energy, Roaring Skies / ROS 97
- `swsh12-135`: Regidrago V, Silver Tempest / SIT 135

All five card records in the supplied card pool mark Expanded legality. These are candidate fixture printings; use the exact `CardManager.getCardByName()` fullName convention for the pinned Twinleaf revision when defining the constants (or use verified card IDs through its native lookup API). No decklist/competitive claim is implied.

— Agent4
