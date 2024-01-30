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
        print(adjusted_symptom)

        if adjusted_symptom in feature_vector:
            print(adjusted_symptom)
            feature_vector[adjusted_symptom] = 1

    input_vector_df = pd.DataFrame([feature_vector])

    predicted_disease = clf.predict(input_vector_df)

    predicted_probabilities = clf.predict_proba(input_vector_df)
    predicted_disease = clf.classes_[np.argmax(predicted_probabilities)]
    confidence = np.max(predicted_probabilities)

    respone = {"disease": str(predicted_disease), "confidence": float(confidence)}

    return respone, 200


if __name__ == "__main__":
    app.run()
