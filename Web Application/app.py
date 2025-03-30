from flask import Flask, request, jsonify, render_template, redirect, url_for
from flask_mail import Mail, Message
import smtplib
import tensorflow
import keras
from keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from keras.preprocessing.text import Tokenizer
import numpy as np
import pickle
import nltk
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from string import punctuation
import pandas as pd


app = Flask(__name__, template_folder='templates', static_folder='static')


model = load_model('language_detection.h5')

with open('PipelineModel.pickle', 'rb') as handle:
    PipelineModel = pickle.load(handle)

with open('dict.pickle', 'rb') as handle:
    dict = pickle.load(handle)

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/language-detection', methods=['POST'])
def language_detection():
    text = request.json['text']
    def word_token(sentence,flage=0):
        token=word_tokenize(sentence)
        if flage==1:
            return token
        return '  ||  '.join(token)

    def remove_stop_word(sentence):
        stop_words = stopwords.words('english')
        punct = list(punctuation)
        token=word_token(sentence,1)
        words=[]
        for word in token:
            if  word not in punct and not word.isdigit() :
                words.append(word.lower())
        return words  
    
    def get_code(N):
        for x,y in dict.items():
            if y==N:
                return x
                
    def prediction_function(sentence):
        sent=' '.join(remove_stop_word(sentence))
        sent=PipelineModel.transform([sent])
        sent=pd.DataFrame.sparse.from_spmatrix(sent)
        return get_code(np.argmax(model.predict(sent)))

    predictionText = prediction_function(text)
   
    
    response = jsonify({'predictionText': predictionText})
    response.headers.add('Access-Control-Allow-Origin', '*')
    
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)