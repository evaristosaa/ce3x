"""Integration checks against an independently installed CE3X 3.2 runtime."""
import copy
import importlib.util
import os
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('estimator',ROOT/'scripts/estimate-systems.py')
estimator=importlib.util.module_from_spec(spec)
spec.loader.exec_module(estimator)
ENGINE_ROOT=Path(os.environ.get('CE3X_ENGINE_ROOT',r'C:\Program Files (x86)\CE3Xv3.2'))


@unittest.skipUnless(os.name=='nt' and (ENGINE_ROOT/'ce3xv3.2.exe').is_file(),
                     'Requires the installed Windows CE3X 3.2 runtime')
class OfficialEstimationTests(unittest.TestCase):
    def test_reference_performances(self):
        result=estimator.estimate(estimator.probe_request(),ENGINE_ROOT)
        self.assertEqual([r['seasonalPerformancePercent'] for r in result['systems']],
                         [{'ACS':77.2},{'calefaccion':153.0,'refrigeracion':113.9}])
        self.assertEqual(len(result['runtimeExecutableSha256']),64)
        self.assertEqual(len(result['seasonalModuleSha256']),64)

    def test_changed_combustion_and_heat_pump_nominal_inputs_affect_results(self):
        request=copy.deepcopy(estimator.probe_request())
        request['systems'][0]['parameters']['rendCombCaldera']=85
        request['systems'][1]['parameters']['rendNominalCal']=300
        result=estimator.estimate(request,ENGINE_ROOT)['systems']
        self.assertLess(result[0]['seasonalPerformancePercent']['ACS'],77.2)
        self.assertGreater(result[1]['seasonalPerformancePercent']['calefaccion'],153)
        self.assertEqual(result[1]['seasonalPerformancePercent']['refrigeracion'],113.9)

    def test_out_of_range_load_is_rejected(self):
        request=estimator.probe_request()
        request['systems'][0]['parameters']['cargaMediaCaldera']=1.5
        with self.assertRaisesRegex(ValueError,'Out of range'):
            estimator.estimate(request,ENGINE_ROOT)

    def test_unrecognized_runtime_parameter_is_rejected(self):
        request=estimator.probe_request()
        request['systems'][0]['parameters']['pythonCode']='print(1)'
        with self.assertRaisesRegex(ValueError,'Unknown estimation parameter'):
            estimator.estimate(request,ENGINE_ROOT)

    def test_missing_nominal_performance_is_rejected(self):
        request=estimator.probe_request()
        del request['systems'][1]['parameters']['rendNominalRef']
        with self.assertRaisesRegex(ValueError,'Incomplete electric heat-pump'):
            estimator.estimate(request,ENGINE_ROOT)

    def test_combustion_boiler_cannot_use_electricity(self):
        request=estimator.probe_request()
        request['systems'][0]['fuel']='Electricidad'
        with self.assertRaisesRegex(ValueError,'cannot use electricity'):
            estimator.estimate(request,ENGINE_ROOT)


if __name__=='__main__':
    unittest.main()
