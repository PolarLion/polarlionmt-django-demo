

import time
import socket
import sys
import json
import http.client,urllib.parse
import pyltp

ltp_segmentor = pyltp.Segmentor()
ltp_segmentor.load("/home/xwshi/tools/ltp_data_v3.4.0/cws.model")
# import requests
# import urllib2
# import commands

model_id = {"transformer":{"en-zh":100, "zh-en":101},}


def save_query(model="nmt", language="null", client_ip="null", str_query="null", str_return="null", logfilename="/home/xwshi/PolarlionSite/PolarlionMT/mysite/query.log"):
  logfile = open(logfilename, 'a', encoding='utf8')
  logfile.write('\n')
  logfile.write(str(time.strftime('%Y-%m-%d %X',time.localtime(time.time()))).strip()+'\t')
  # logfile.write("sys.getdefaultencoding() %s\t" % sys.getdefaultencoding())
  logfile.write('src: %s\t'% str_query)
  logfile.write("| tgt: %s\t"% str_return)
  logfile.write('| language: %s\t' % language)
  logfile.write('| model: %s\t' % model)
  logfile.write("| client_ip: %s\t" % client_ip)
  logfile.close()



def nmt_caller(query, ip="127.0.0.1", model="transformer", language="en-zh"):
  # print("nmt_caller str(query)", query)
  if language[:2] == "zh":
    query = ' '.join(ltp_segmentor.segment(query))

  print("untils.py nmt_caller() query", query)

  post_dict = json.dumps([{"src": query, "id":model_id[model][language]}])
  headers = {"Content-Type": "application/json"}
  conn = http.client.HTTPConnection("127.0.0.1", 5000)
  conn.request('POST', "/translator/translate", post_dict, headers)
  response = conn.getresponse()
  print(response.status, response.reason)
  # print("response", response)
  data = json.load(response)[0][0]
  # data = json.load(data)
  # print("untills.py nmt_caller() data",data, type(data))
  tgt = data['tgt']
  print("untills.py nmt_caller() data['tgt]", tgt)

  # print("data",type(data))
  save_query(client_ip=ip, str_query=data['src'], str_return=data['tgt'], language=language, model=model)

  print("untills.py nmt_caller() data", json.dumps(data))

  return json.dumps(data)

  # return data

if __name__=="__main__":
  nmt_caller(sys.argv[1])