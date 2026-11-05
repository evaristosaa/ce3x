import http.client
import json
from pathlib import Path
import sys
from threading import Thread
import unittest
from http.server import ThreadingHTTPServer

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'app'))
from server import Ce3xHandler
from estimation_service import estimation_status


class EstimationHTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),Ce3xHandler)
        cls.thread=Thread(target=cls.server.serve_forever,daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown();cls.server.server_close();cls.thread.join()

    def request(self,path,body=None,headers=None):
        connection=http.client.HTTPConnection('127.0.0.1',self.server.server_port,timeout=60)
        connection.request('POST' if body is not None else 'GET',path,body=body,headers=headers or {})
        response=connection.getresponse();status=response.status;payload=json.loads(response.read());connection.close()
        return status,payload

    def test_status_has_availability_and_explains_scope(self):
        status,payload=self.request('/api/estimation/status')
        self.assertEqual(status,200);self.assertIsInstance(payload['available'],bool);self.assertTrue(payload['message'])

    def test_cross_origin_calculation_is_rejected(self):
        status,payload=self.request('/api/estimation','{}',{'Content-Type':'application/json','Origin':'https://unrelated.example'})
        self.assertEqual(status,403)

    def test_wrong_content_type_is_rejected(self):
        self.assertEqual(self.request('/api/estimation','{}',{'Content-Type':'text/plain'})[0],415)

    def test_invalid_json_is_rejected(self):
        self.assertEqual(self.request('/api/estimation','{',{'Content-Type':'application/json'})[0],400)

    def test_oversized_request_is_rejected(self):
        self.assertEqual(self.request('/api/estimation','x'*65537,{'Content-Type':'application/json'})[0],413)

    @unittest.skipUnless(estimation_status()['available'],'Requires installed CE3X 3.2')
    def test_valid_request_returns_official_performance_and_module_identity(self):
        request={'context':{'zone':'B4','buildingType':'Unifamiliar'},'systems':[
            {'id':'boiler','service':'ACS','generator':'Caldera Estándar','fuel':'GLP','parameters':{
                'aislanteCaldera':'Bien aislada y mantenida','rendCombCaldera':90,'potenciaCaldera':24,
                'cargaMediaCaldera':0.2,'vectorTipoCaldera':[0,0,1,0,0,1,0]}}]}
        status,payload=self.request('/api/estimation',json.dumps(request),{'Content-Type':'application/json'})
        self.assertEqual(status,200);self.assertEqual(payload['systems'][0]['seasonalPerformancePercent']['ACS'],77.2)
        self.assertEqual(len(payload['seasonalModuleSha256']),64)


if __name__=='__main__':unittest.main()
