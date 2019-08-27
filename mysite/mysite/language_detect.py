# -*- coding: utf-8 -*-
import sys
# import re
# import pickle
import math
# import sentencepiece as sp

epsilon = 1e-9

def count_ngram(infilename, outfilename):
  lines = open(infilename, 'r').readlines()
  unigram_dict = {}
  count_unigram = 0

  bigram_dict = {}
  count_bigram = 0

  trigram_dict = {}
  count_trigram = 0

  fourgram_dict = {}
  count_4gram = 0

  lines_num = len(lines)
  for i,l in enumerate(lines):
    if i%500 == 0:
      sys.stdout.write("\r")
      sys.stdout.write("%.2f  %d" % (float(i)*100/lines_num, i))
      sys.stdout.flush()
    unicode_words = l.strip().decode('utf-8', 'replace')
    # print(words)
    length = len(unicode_words)
    words = []
    for i in range(length):
      words.append(unicode_words[i].encode('utf-8'))

    for i in range(length):
      # print(w, w.encode('utf-8'))
      unigram = words[i]
      count_unigram += 1
      if unigram in unigram_dict:
      	unigram_dict[unigram] += 1
      else:
      	unigram_dict[unigram] = 1

      if i >= length -1: continue
      bigram = unigram + words[i+1]
      count_bigram += 1
      if bigram in bigram_dict:
      	bigram_dict[bigram] += 1
      else:
      	bigram_dict[bigram] = 1

      if i >= length - 2: continue
      trigram = bigram + words[i+2]
      count_trigram += 1
      if trigram in trigram_dict:
      	trigram_dict[trigram] += 1
      else:
      	trigram_dict[trigram] = 1

      if i >= length - 3: continue
      fourgram = trigram + words[i+3]
      count_4gram += 1
      if fourgram in fourgram_dict:
      	fourgram_dict[fourgram] += 1
      else:
      	fourgram_dict[fourgram] = 1

    # exit()

  print("")
  print("unigram_dict size: %d" % len(unigram_dict))
  print("bigram_dict size: %d" % len(bigram_dict))
  print("trigram_dict size: %d" % len(trigram_dict))
  print("4gram_dict size: %d" % len(fourgram_dict))
  # print(unigram_dict)

  

  with open(outfilename+'.1gram', 'w') as outfile:
  	for w,k in sorted(unigram_dict.items(), key=lambda item:item[1], reverse=True):
  	  if k > 5:
  	    # print(w)
  	    outfile.write("%s\t%.15f\n" % (w.strip(), k*1./count_unigram))

  with open(outfilename+'.2gram', 'w') as outfile:
  	for w,k in sorted(bigram_dict.items(), key=lambda item:item[1], reverse=True):
  	  if k > 5:
  	    # print(w)
  	    outfile.write("%s\t%.15f\n" % (w.strip(), k*1./count_bigram))
  	    # outfile.write(w.strip()+'\n')

  with open(outfilename+'.3gram', 'w') as outfile:
  	for w,k in sorted(trigram_dict.items(), key=lambda item:item[1], reverse=True):
  	  if k > 5:
  	    # print(w)
  	    outfile.write("%s\t%.15f\n" % (w.strip(), k*1./count_trigram))
  	    # outfile.write(w.strip()+'\n')

  with open(outfilename+'.4gram', 'w') as outfile:
  	for w,k in sorted(fourgram_dict.items(), key=lambda item:item[1], reverse=True):
  	  if k > 5:
  	    # print(w)
  	    outfile.write("%s\t%.15f\n" % (w.strip(), k*1./count_4gram))
  	    # outfile.write(w.strip()+'\n')


def sentence_to_ngrams(sentence, max_n=4):
  # python2
  # unicode_words = sentence.strip().decode('utf-8', 'replace')
  # python3
  # print(sentence, type(sentence))
  unicode_words = sentence.encode('unicode_escape', 'replace').decode('unicode_escape')
  # print(unicode_words, type(unicode_words))
  length = len(unicode_words)
  # print(length)
  words = []
  for i in range(length):
    # python2 
    # words.append(unicode_words[i].encode('utf-8'))
    # python3
    words.append(unicode_words[i])
  # print(words)
  # print(length)
  grams = []
  for n in range(max_n):
    grams.append([])
  # print(gram)
  # print(grams)
  for i in range(length):
    gram = [''] * max_n
    gram[0] = words[i]
    # print(0, gram[0])
    grams[0].append(gram[0])
    # print(0, grams)
    for n in range(1, max_n):
      if i >= length - n: break
      gram[n] = gram[n-1] + words[i+n]
      # print(n, gram[n])
      # print(n, grams[n])
      grams[n].append(gram[n])
      # print(n, grams)
    # break

  # for n in range(max_n):
    # print(grams[n])

  return grams


def sentence_to_feature(sentence, ngram_dict, max_n=4):
  ngrams = sentence_to_ngrams(sentence, max_n)
  n_score = []
  for n in range(max_n):
    score = 0
    for item in ngrams[n]:
      # print(item, type(item))
      if item in ngram_dict[n]:
        # print("in")
        score += math.log(ngram_dict[n][item])
        # print(score)
      else:
        score += math.log(epsilon)
    n_score.append(score*(0.5**n))

  return sum(n_score), n_score


def load_ngram_dict(filename, max_n=4):
  ngram_dict = []
  for n in range(max_n):
    d = {}
    file = "%s.%dgram" % (filename, n+1)
    lines = open(file, 'r', encoding='utf8', errors='replace').readlines()
    for l in lines:
      # print(l)
      temp = l.strip().split('\t')
      if len(temp) < 2:continue
      # print(temp[0], type(temp[0]))
      d[temp[0]] = float(temp[1])
    # print(d)
    # exit()
    ngram_dict.append(d)
  # print(ngram_dict)
  return ngram_dict


def language_detect(sentence):
  language_list = ['Zh', 'En', 'Ug']
  language_ngram_dict = {}
  for language in language_list:
    language_ngram_dict[language] = load_ngram_dict("/home/xwshi/PolarlionSite/PolarlionMT/mysite/static/gram/%s" % language)
  # zh_ngram_dict = load_ngram_dict("Zh")
  # en_ngram_dict = load_ngram_dict("En")
  # ug_ngram_dict = load_ngram_dict("Ug")
  language_score = []
  score, _ = sentence_to_feature("我有一个梦想", language_ngram_dict['Zh'])
  print("梦想", score)
  for language in language_list:
    score, _ = sentence_to_feature(sentence, language_ngram_dict[language])
    print(score, language, sentence)
    language_score.append(score)
  # score, n_score = sentence_to_feature("I have a dream !", en_ngram_dict)
  # print(score, n_score)
  # score, n_score = sentence_to_feature("I have a dream !", zh_ngram_dict)
  # print(score, n_score)
  print(language_list[language_score.index(max(language_score))])
  # score, n_score = sentence_to_feature("我有一个梦想 !", en_ngram_dict)
  # print(score, n_score)
  # score, n_score = sentence_to_feature("我有一个梦想 !", zh_ngram_dict)
  # print(score, n_score)


if __name__ == '__main__':
  if sys.argv[1] == "cn":
  	count_ngram(sys.argv[2], sys.argv[3])
  elif sys.argv[1] == "s2n":
  	sentence_to_ngrams("I have a dream !")
  elif sys.argv[1] == "ld":
    language_detect("I have a dream")
    language_detect("我有一个梦想")
    language_detect("ﺏۇ ﺵەﺮﺘﻧﺎﻣە ﺉﻰﻜﻛﻯ ﺩۆﻝەﺖﻧﻯڭ پېﺶﻗەﺩەﻡ ﺏﻯﺭ ﺉەۋﻼﺗ ﺭەھﺏەﺮﻟﻯﺭﻯ ﺏﻯﺯگە ﻕﺎﻟﺩۇﺮﻏﺎﻧ ﻡﻭھﻰﻣ ﻡﻯﺭ")