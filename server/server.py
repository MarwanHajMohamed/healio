from flask import Flask, request, jsonify
from flask_cors import CORS
from joblib import load
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__, static_folder="./build", static_url_path="/")
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

model = load("./model/healioBot.pkl")
vectorizer = load("./model/vectorizer.pkl")


def clean_text(sent):
    # remove punctuations
    sent = sent.translate(str.maketrans("", "", string.punctuation)).strip()

    # remove stopwords
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(sent)
    words = [word for word in words if word not in stop_words]

    return " ".join(words).lower()


def make_pred(model, text):
    text = clean_text(text)
    tfidf = vectorizer.transform([text])
    disease = model.predict(tfidf)

    return disease[0]


@app.route("/")
def home():
    return {"message": "Hello from backend 2"}


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    prediction = make_pred(model, data["data"])
    return prediction
    # return data


if __name__ == "__main__":
    app.run()
