import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class CourseRecommender:
    def __init__(self, csv_path):
        self.courses = pd.read_csv(csv_path)
        self.courses.fillna('', inplace=True)
        self.vectorizer = TfidfVectorizer(stop_words='english')
        # Combine relevant text fields for NLP - using your CSV columns
        self.courses['combined'] = self.courses.apply(
            lambda row: ' '.join([str(row.get('course_number', '')), str(row.get('tags', '')), str(row.get('prerequisites', ''))]), axis=1)
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
        
        # Transform the query
        query_vec = self.vectorizer.transform([query])
        
        # Calculate cosine similarities
        cosine_similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top N course indices
        top_indices = cosine_similarities.argsort()[-top_n:][::-1]
        
        # Return recommended courses
        recommendations = []
        for idx in top_indices:
            course = self.courses.iloc[idx]
            recommendations.append({
                'course_number': course.get('course_number', 'N/A'),
                'tags': course.get('tags', 'N/A'),
                'prerequisites': course.get('prerequisites', 'N/A'),
                'quarters_offered': course.get('quarters_offered', 'N/A'),
                'difficulty_rating': course.get('difficulty_rating', 'N/A'),
                'score': cosine_similarities[idx]
            })
        
        return recommendations
