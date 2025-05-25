import json
import pickle
import numpy as np
import random

import nltk
nltk.download('punkt')
nltk.download('wordnet')

from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()

from tensorflow.keras.models import load_model

from flask import Flask, jsonify, abort
from flask_cors import CORS

# Load model and data
model = load_model(r'C:\chatbot\chatbot_model.h5')
intents = json.loads(open(r'C:\chatbot\intents.json', encoding='UTF-8').read())
words = pickle.load(open(r'C:\chatbot\words.pkl', 'rb'))
classes = pickle.load(open(r'C:\chatbot\classes.pkl', 'rb'))

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_detail=False):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_detail:
                    print(f"found in bag: {w}")
    return np.array(bag)

def predict_class(sentence, model):
    p = bow(sentence, words, show_detail=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    result_list = []
    for r in results:
        result_list.append({'intent': classes[r[0]], 'probability': str(r[1])})
    return result_list

def getResponse(ints, intents_json):
    tag = ints[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            return result
    return "Sorry, I didn't understand that."

def chatbot_response(msg):
    try:
        ints = predict_class(msg, model)
        if not ints:
            return "Sorry, I didn't understand that. Could you please rephrase?"
        
        res = getResponse(ints, intents)
        if not res:
            return "Sorry, I don't have information on that right now."
        return res
    except Exception as e:
        print(f"Error in chatbot_response: {e}")
        return "Sorry, something went wrong while processing your request."

app = Flask(__name__)
CORS(app)

def decrypt(msg):
    return msg.replace("+", " ")

@app.route('/')
def home():
    return jsonify({'message': "Welcome to the StatBot!."})

@app.route("/query/<sentence>", methods=['GET'])
def query_chatbot(sentence):
    dec_msg = decrypt(sentence)
    response = chatbot_response(dec_msg)
    return jsonify({'response': response})

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({'error': 'Sorry, the requested resource was not found.'}), 404

if __name__ == '__main__':
    app.run(debug=True)

