import streamlit as st
import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from recommender.recommender import CourseRecommender

# Path to the CSV file
data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'new_cse.csv')

# Initialize recommender
recommender = CourseRecommender(data_path)

st.title('UCSC Course Recommendation System')
st.write('Get personalized course recommendations based on your interests, major, skill level, and time availability.')

# User input form
with st.form('preferences_form'):
    interests = st.text_input('Your interests (comma separated)', placeholder='machine learning, web development, algorithms')
    major = st.text_input('Your major (optional)', value='Computer Engineering')
    skill_level = st.selectbox('Skill level', ['Any', 'Beginner', 'Intermediate', 'Advanced'])
    term = st.text_input('Preferred term (e.g., Fall 2025, Spring 2026, or leave blank for any)', value='Fall 2025')
    num_recommendations = st.slider('Number of recommendations', 1, 10, 3)
    
    submitted = st.form_submit_button('Get Recommendations')

if submitted:
    preferences = {
        'interests': interests,
        'major': major,
        'skill_level': skill_level,
        'time_availability': term
    }
    
    try:
        recommendations = recommender.recommend(preferences, top_n=num_recommendations)
        
        st.subheader('Recommended Courses:')
        for i, course in enumerate(recommendations, 1):
            with st.expander(f"{i}. {course['course_number']} (Score: {course['score']:.3f})"):
                st.write(f"**Tags:** {course['tags']}")
                st.write(f"**Prerequisites:** {course['prerequisites']}")
                st.write(f"**Offered:** {course['quarters_offered']}")
                st.write(f"**Difficulty:** {course['difficulty_rating']}/5")
                
    except Exception as e:
        st.error(f"Error getting recommendations: {str(e)}")
