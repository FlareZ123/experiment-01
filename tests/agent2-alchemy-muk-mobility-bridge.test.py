"""Regression checks for printed retreat routes and Muk."""
from __future__ import annotations
import importlib.util
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
S = importlib.util.spec_from_file_location('mobility', ROOT/'simulation'/'evaluation'/'agent2-alchemy-muk-mobility-bridge.py')
M = importlib.util.module_from_spec(S)
S.loader.exec_module(M)
TOTAL = M.BASE.input_decks(ROOT)[2][0]

def check(h, start, prized=()):
    return M.mobility_witness(h, list(prized),start,TOTAL)

class MobilityCases(unittest.TestCase):
    def test_active_regidrago(self):
        h=['Regidrago V','Alolan Grimer','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Grass Energy','Battle Compressor Team Flare Gear','Guzma']
        self.assertEqual(check(h,h[:7]),(True,False,False,True,False))

    def test_budew_free_retreat(self):
        h=['Budew','Alolan Grimer','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Grass Energy','Battle Compressor Team Flare Gear','Quick Ball','Dialga-GX']
        self.assertEqual(check(h,h[:7]),(False,True,False,True,False))

    def test_latias_ability_suppressed(self):
        h=['Latias ex','Alolan Grimer','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear','Regidrago V','Guzma']
        self.assertEqual(check(h,h[:7]),(False,False,False,False,True))

    def test_float_stone_works(self):
        h=['Latias ex','Alolan Grimer','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear','Regidrago V','Float Stone']
        self.assertEqual(check(h,h[:7]),(False,False,True,True,False))

    def test_float_stone_payment_reservation(self):
        h=['Latias ex','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Grass Energy','Quick Ball','Float Stone','Regidrago V']
        self.assertEqual(check(h,h[:7]),(False,False,False,False,False))
        h.append('Dialga-GX')
        self.assertEqual(check(h,h[:7]),(False,False,True,True,False))

    def test_late_draw_not_initial_active(self):
        h=['Alolan Grimer','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear','Guzma','Budew','Regidrago V','Float Stone']
        self.assertEqual(check(h,h[:7]),(False,False,False,False,False))

    def test_prized_muk_blocks_line(self):
        h=['Regidrago V','Budew','Boost Shake','Regidrago VSTAR','Double Dragon Energy','Basic Fire Energy','Battle Compressor Team Flare Gear','Alolan Grimer','Float Stone']
        self.assertEqual(check(h,h[:7],['Alolan Muk','Alolan Muk']),(False,False,False,False,False))

    def test_missing_vstar(self):
        h=['Regidrago V','Alolan Grimer','Boost Shake','Double Dragon Energy','Basic Grass Energy','Battle Compressor Team Flare Gear','Guzma']
        self.assertEqual(check(h,h[:7]),(False,False,False,False,False))

    def test_fixed_starter_types(self):
        self.assertEqual(M.FREE_RETREAT,{'Budew'})
        self.assertEqual(M.OTHER_ACTIVE,{'Koraidon ex','Tapu Lele-GX','Latias ex','Dialga-GX','Kyurem'})
        _,decks,_=M.BASE.input_decks(ROOT)
        self.assertEqual(sum(x!=y for x,y in zip(*decks)),1)

    def test_seeded_mobility_monotonicity(self):
        a=M.run(ROOT,trials=64,seed=31337)
        self.assertEqual(a,M.run(ROOT,trials=64,seed=31337))
        for row in a['strata']:
            for candidate in ('v0','v1'):
                for mode in ('activeRegi','budewZeroRetreat','floatOtherActive'):
                    self.assertGreaterEqual(row['metrics']['eitherMobile'][candidate],row['metrics'][mode][candidate])

if __name__=='__main__':
    unittest.main(verbosity=2)
