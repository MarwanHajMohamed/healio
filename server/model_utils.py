import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np

import pandas as pd

import spacy

# Make sure to include nlp model loading if needed
# e.g., nlp = spacy.load("en_core_sci_lg")
nlp = spacy.load("en_core_sci_lg")
lemmatizer = WordNetLemmatizer()
# nltk.download("wordnet")

data = pd.read_csv("dataset/Model Training.csv")
data_cleaned = data.drop(columns=["Unnamed: 133"])
X = data_cleaned.drop(columns=["prognosis"])  # Features
y = data_cleaned["prognosis"]


def preprocess_and_lemmatize(symptoms):
    return [
        lemmatizer.lemmatize(symptom.lower().replace("_", " ")) for symptom in symptoms
    ]


symptoms_in_dataset = list(X.columns)
dataset_symptoms = preprocess_and_lemmatize(symptoms_in_dataset)


def find_closest_symptoms(user_input):
    # Preprocess user input
    user_symptoms = preprocess_and_lemmatize(nltk.word_tokenize(user_input))

    # Use CountVectorizer to create a simple BOW model
    vectorizer = CountVectorizer().fit(dataset_symptoms + user_symptoms)
    dataset_vectors = vectorizer.transform(dataset_symptoms)
    user_vectors = vectorizer.transform(user_symptoms)

    # Find the closest match for each user symptom
    closest_matches = {}
    for user_symptom, user_vector in zip(user_symptoms, user_vectors):
        similarity = cosine_similarity(user_vector, dataset_vectors)
        max_similarity_index = np.argmax(similarity)
        closest_matches[user_symptom] = dataset_symptoms[max_similarity_index]

    return closest_matches


def extract_symptoms(text):
    # Process the text
    doc = nlp(text)
    symptoms = []

    for word in doc.ents:
        symptoms.append(word.text.replace(" ", "_"))

    # Extract entities that might be symptoms
    # symptoms = [ent.text for ent in doc.ents if ent.label_ in ["SYMPTOM", "DISEASE"]]
    return symptoms


def predict_disease_with_confidence(sentence, clf, symptoms_in_dataset):
    extracted_symptoms = extract_symptoms(sentence)

    matched_symptoms = find_closest_symptoms(
        " ".join(extracted_symptoms), dataset_symptoms
    )

    feature_vector = {symptom: 0 for symptom in symptoms_in_dataset}
    for _, dataset_symptom in matched_symptoms.items():
        adjusted_symptom = dataset_symptom.replace(" ", "_")
        if adjusted_symptom in feature_vector:
            print(adjusted_symptom)
            feature_vector[adjusted_symptom] = 1

    input_vector_df = pd.DataFrame([feature_vector])

    predicted_disease = clf.predict(input_vector_df)

    predicted_probabilities = clf.predict_proba(input_vector_df)
    predicted_disease = clf.classes_[np.argmax(predicted_probabilities)]
    confidence = np.max(predicted_probabilities)

    return predicted_disease, confidence
