from flask import Flask, request, jsonify
from flask_cors import CORS  # Add this line
import pandas as pd
import os
from recommender.recommender import CourseRecommender

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})csv_path = 'new_cse.csv'
recommender = CourseRecommender(csv_path)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Backend is running!', 'message': 'Flask API is working'})

@app.route('/api/courses', methods=['GET'])
def get_all_courses():
    try:
        courses_df = pd.read_csv(csv_path)
        courses = []
        
        for _, row in courses_df.iterrows():
            courses.append({
                'course_number': row['course_number'],
                'tags': row['tags'],
                'prerequisites': row['prerequisites'],
                'quarters_offered': row['quarters_offered'],
                'difficulty_rating': row['difficulty_rating']
            })
        
        return jsonify({
            'courses': courses,
            'total': len(courses),
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        completed_courses = data.get('completed_courses', [])
        preferences = data.get('preferences', {})
        top_n = data.get('top_n', 5)
        
        recommendations = recommender.get_recommendations(completed_courses, preferences, top_n)
        
        return jsonify({
            'recommendations': recommendations,
            'completed_courses': completed_courses,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

if __name__ == '__main__':
    print("🚀 Starting UCSC Course Recommender API...")
    print("📊 Loading course data...")
    print(f"✅ Found {len(pd.read_csv(csv_path))} courses in database")
    print("🌐 API running on http://localhost:5000")
    app.run(debug=True, port=5001, host='0.0.0.0')