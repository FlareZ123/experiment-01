"""Run: python tests/2026-11/agent39-t2-maxgeist-search-flow.test.py"""
import importlib.util
from pathlib import Path
import unittest

SOURCE=Path(__file__).resolve().parents[2]/'simulation'/'evaluation'/'2026-11'/'agent39-t2-maxgeist-search-flow.py'
spec=importlib.util.spec_from_file_location('agent39_search_flow',SOURCE)
s=importlib.util.module_from_spec(spec)
spec.loader.exec_module(s)

def h(**values):
    out=[0]*10
    idx={'v':s.V,'vmax':s.VM,'psychic':s.E,'dimension':s.D,
         'seal':s.F,'fog':s.FOG,'mystery':s.MYST,'arven':s.ARVEN,
         'basic':s.BASIC,'other':s.OTHER}
    for key,n in values.items():out[idx[key]]=n
    return tuple(out)

class ExactPolicyConstraints(unittest.TestCase):
    def test_direct_and_missing_card(self):
        self.assertTrue(s.possible(h(psychic=1,vmax=1,dimension=1),h()))
        self.assertFalse(s.possible(h(psychic=1,vmax=1),h()))

    def test_mysterious_discard_cost_not_just_graph_reachability(self):
        self.assertTrue(s.possible(
            h(psychic=1,dimension=1,mystery=1,other=1),h(vmax=1)))
        self.assertFalse(s.possible(
            h(psychic=1,dimension=1,mystery=1),h(vmax=1)))
        # An intentionally illegal/no-cost search variant exposes the
        # exact state where naive connector reachability is optimistic.
        self.assertTrue(s.possible(
            h(psychic=1,dimension=1,mystery=1),h(vmax=1),
            free_myst_discard=True))

    def test_forest_seal_and_single_arven(self):
        self.assertTrue(s.possible(h(psychic=1,dimension=1,seal=1),
                                   h(vmax=1)))
        self.assertTrue(s.possible(h(psychic=1,vmax=1,seal=1),
                                   h(dimension=1)))
        self.assertTrue(s.possible(h(psychic=1,vmax=1,arven=1),
                                   h(seal=1,fog=1,dimension=1)))
        self.assertFalse(s.possible(h(psychic=1,vmax=1,arven=1),
                                    h(fog=1,dimension=1)))
        self.assertFalse(s.possible(h(psychic=1,vmax=1,seal=1),
                                    h(dimension=1),fss_used_initial=True))

    def test_arven_mysterious_and_seal_joint_pair_is_necessary(self):
        hand=h(psychic=1,arven=1,other=1)
        remaining=h(vmax=1,dimension=1,seal=1,mystery=1)
        self.assertTrue(s.possible(hand,remaining))
        self.assertFalse(s.possible(hand,remaining,
                                    block_arven_myst_fss=True))
        # Mysterious Treasure still discards the spare hand card and
        # Forest Seal Stone still searches exactly one other card.

    def test_physical_seed_is_replayable_and_nested_rates_order(self):
        a=s.run(3000,390039,s.BASE)
        b=s.run(3000,390039,s.BASE)
        self.assertEqual({k:v for k,v in a.items() if k!='seconds'},
                         {k:v for k,v in b.items() if k!='seconds'})
        self.assertLessEqual(a['t2'],a['t1Energy'])
        self.assertLessEqual(a['t1Energy'],a['vFound'])
        self.assertLessEqual(a['vFound'],a['valid'])
        self.assertLessEqual(a['valid'],a['n'])

if __name__=='__main__':unittest.main()
