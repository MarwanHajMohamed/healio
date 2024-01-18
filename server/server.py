from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS
from joblib import load
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

model = load("./model/healioBot.pkl")
neighbour_model = load("./model/neighbour_model.pkl")
vectorizer = load("./model/vectorizer.pkl")


def clean_text(sent):
    # remove punctuations
    sent = sent.translate(str.maketrans("", "", string.punctuation)).strip()

    # remove stopwords
    stop_words = set(stopwords.words("english"))
    words = word_tokenize(sent)
    words = [word for word in words if word not in stop_words]

    return " ".join(words).lower()


def calculate_confidence(distances):
    # Using inverse of distances as confidence
    # Prevent division by zero
    inv_distances = 1 / np.maximum(distances, 1e-5)
    confidence = np.mean(inv_distances, axis=1)
    return confidence


def make_pred(model, neighbour_model, text):
    text = clean_text(text)
    tfidf = vectorizer.transform([text])
    disease = model.predict(tfidf)[0]

    distances, _ = neighbour_model.kneighbors(tfidf)

    confidence = calculate_confidence(distances)[0]

    return disease, confidence


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    disease, confidence = make_pred(model, neighbour_model, data["data"])

    # Create a response object
    response = {"disease": disease, "confidence": confidence}

    # Return the response as JSON
    return jsonify(response)


if __name__ == "__main__":
    app.run()
