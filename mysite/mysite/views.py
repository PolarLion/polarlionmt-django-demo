# -*- coding: utf-8 -*- 


import sys

from django.http import HttpResponse
from django.shortcuts import render_to_response
from mysite.untils import *


def index(request):
  return render_to_response('index.html', {'IMAGES_URL': '/static/images/', 'JS_URL':'/static/js/', 'CSS_URL':'/static/css/'})
  #return render_to_response('starter-template/index.html', {})

def contactpage(request):
  return render_to_response('contactpage.html', {'IMAGES_URL': '/static/images/', 'JS_URL':'/static/js/', 'CSS_URL':'/static/css/'})


def nmt(request, a=None):
  print("views.py request", request, type(request))
  # print("views.py request.GET", request.GET, type(request))
  query = request.GET.get('q',None)
  ip = request.GET.get('ip',None)
  language = request.GET.get('language',None)
  model = request.GET.get('model',None)
  print("views.py nmt()", query, ip, model, language)
  return HttpResponse(nmt_caller(query, ip, model, language))
  

