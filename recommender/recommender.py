import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class CourseRecommender:
    def __init__(self, csv_path):
        self.courses = pd.read_csv(csv_path)
        self.courses.fillna('', inplace=True)
        self.vectorizer = TfidfVectorizer(stop_words='english')
        # Combine relevant text fields for NLP
        self.courses['combined'] = self.courses.apply(
            lambda row: ' '.join([str(row.get('title', '')), str(row.get('description', '')), str(row.get('tags', ''))]), axis=1)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.courses['combined'])

    def recommend(self, preferences, top_n=5):
        """
        preferences: dict with keys like 'interests', 'major', 'skill_level', 'time_availability'
        """
        # Build a query string from preferences
        query = ' '.join([
            preferences.get('interests', ''),
            preferences.get('major', ''),
            preferences.get('skill_level', ''),
            preferences.get('time_availability', '')
        ])
        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        self.courses['relevance'] = similarities
        # Filter by time_availability if provided
        if preferences.get('time_availability'):
            mask = self.courses['time'].str.contains(preferences['time_availability'], case=False, na=False)
            filtered = self.courses[mask].copy()
        else:
            filtered = self.courses.copy()
        # Sort by relevance
        recommended = filtered.sort_values('relevance', ascending=False).head(top_n)
        return recommended[['course_id', 'title', 'description', 'relevance']].to_dict(orient='records')
