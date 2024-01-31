from joblib import load
import pandas as pd
import numpy as np
from model_utils import (
    extract_symptoms,
    find_closest_symptoms,
    preprocess_and_lemmatize,
)
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

clf = load("model/healioBot.pkl")

data = pd.read_csv("dataset/Model Training.csv")
data_cleaned = data.drop(columns=["Unnamed: 133"])
X = data_cleaned.drop(columns=["prognosis"])
y = data_cleaned["prognosis"]

symptoms_in_dataset = list(X.columns)
dataset_symptoms = preprocess_and_lemmatize(symptoms_in_dataset)


@app.route("/predict", methods=["POST"])
def predict():
    json_data = request.json

    text = json_data.get("data", "")

    extracted_symptoms = extract_symptoms(text)
    matched_symptoms = find_closest_symptoms(" ".join(extracted_symptoms))

    feature_vector = {symptom: 0 for symptom in symptoms_in_dataset}
    for _, dataset_symptom in matched_symptoms.items():
        adjusted_symptom = dataset_symptom.replace(" ", "_")
        if adjusted_symptom in feature_vector:
            feature_vector[adjusted_symptom] = 1

    input_vector_df = pd.DataFrame([feature_vector])

    # Get predicted probabilities for each class
    predicted_probabilities = clf.predict_proba(input_vector_df)[0]

    # Get the indices of the top 3 predictions
    indices = np.argsort(predicted_probabilities)[-3:][::-1]

    # Extract the top 3 predictions and their probabilities
    top_diseases = [
        ({"disease": clf.classes_[i], "confidence": predicted_probabilities[i]})
        for i in indices
    ]

    return top_diseases


if __name__ == "__main__":
    app.run()
