import streamlit as st
from recommender.recommender import CourseRecommender
import os

# Path to the CSV file
data_path = os.path.join(os.path.dirname(__file__), '../data/courses.csv')

# Initialize recommender
recommender = CourseRecommender(data_path)

st.title('UCSC Course Recommendation System')
st.write('Get personalized course recommendations based on your interests, major, skill level, and time availability.')

# User input form
with st.form('preferences_form'):
    interests = st.text_input('Your interests (comma separated)', '')
    major = st.text_input('Your major (optional)', '')
    skill_level = st.selectbox('Skill level', ['Any', 'Beginner', 'Intermediate', 'Advanced'])
    time_availability = st.text_input('Preferred term (e.g., Fall 2025, Spring 2026, or leave blank for any)', '')
    top_n = st.slider('Number of recommendations', 1, 10, 5)
    submitted = st.form_submit_button('Get Recommendations')

if submitted:
    preferences = {
        'interests': interests,
        'major': major,
        'skill_level': '' if skill_level == 'Any' else skill_level,
        'time_availability': time_availability
    }
    results = recommender.recommend(preferences, top_n=top_n)
    if results:
        st.subheader('Recommended Courses:')
        for course in results:
            st.markdown(f"**{course['title']}** ({course['course_id']})  ")
            st.markdown(f"*Relevance Score:* {course['relevance']:.2f}")
            st.markdown(f"{course['description']}")
            st.markdown('---')
    else:
        st.info('No courses matched your preferences. Try adjusting your filters.')
