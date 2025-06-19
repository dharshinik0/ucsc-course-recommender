import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import os

class CourseRecommender:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.courses_df = None
        self.model = None
        self.label_encoders = {}
        self.load_data()
        self.train_model()
    
    def load_data(self):
        """Load course data from CSV file"""
        try:
            if os.path.exists(self.csv_path):
                self.courses_df = pd.read_csv(self.csv_path)
                # Clean column names by stripping whitespace
                self.courses_df.columns = self.courses_df.columns.str.strip()
                
                # Fill NaN values
                self.courses_df.fillna('', inplace=True)
                
                print(f"✅ Found {len(self.courses_df)} courses in database")
                return self.courses_df
            else:
                print(f"❌ Course data file not found at {self.csv_path}")
                return None
        except Exception as e:
            print(f"❌ Error loading course data: {e}")
            return None
    
    def train_model(self):
        """Train a simple recommendation model"""
        if self.courses_df is None or len(self.courses_df) == 0:
            print("❌ No course data available for training")
            return
        
        try:
            # Create features for training
            features = []
            
            # Encode categorical features
            for col in ['tags', 'quarters_offered']:
                if col in self.courses_df.columns:
                    le = LabelEncoder()
                    encoded_values = le.fit_transform(self.courses_df[col].astype(str))
                    features.append(encoded_values)
                    self.label_encoders[col] = le
            
            # Add difficulty rating
            if 'difficulty_rating' in self.courses_df.columns:
                features.append(self.courses_df['difficulty_rating'].fillna(3))
            
            if len(features) > 0:
                X = np.column_stack(features)
                # Create dummy target (in real scenario, this would be based on student enrollment data)
                y = np.random.choice([0, 1], size=len(self.courses_df), p=[0.3, 0.7])
                
                self.model = RandomForestClassifier(n_estimators=10, random_state=42)
                self.model.fit(X, y)
                print("✅ Recommendation model trained successfully")
            else:
                print("❌ No suitable features found for training")
                
        except Exception as e:
            print(f"❌ Error training model: {e}")
    
    def get_recommendations(self, completed_courses, preferences=None, top_n=5):
        """Get course recommendations based on completed courses"""
        if self.courses_df is None:
            return []
        
        try:
            # Filter out already completed courses
            available_courses = self.courses_df[
                ~self.courses_df['course_number'].isin(completed_courses)
            ].copy()
            
            if len(available_courses) == 0:
                return []
            
            # Simple prerequisite checking
            recommendations = []
            
            for _, course in available_courses.iterrows():
                # Basic prerequisite logic
                prereqs = str(course.get('prerequisites', '')).upper()
                
                if prereqs == 'NONE' or prereqs == '' or prereqs == 'NAN':
                    # No prerequisites required
                    can_take = True
                else:
                    # Check if student has completed prerequisites
                    can_take = self._check_prerequisites(prereqs, completed_courses)
                
                if can_take:
                    recommendations.append({
                        'course_number': course['course_number'],
                        'tags': course.get('tags', ''),
                        'prerequisites': course.get('prerequisites', 'NONE'),
                        'quarters_offered': course.get('quarters_offered', ''),
                        'difficulty_rating': int(course.get('difficulty_rating', 3))
                    })
            
            # Sort by difficulty (easier courses first) and limit results
            recommendations.sort(key=lambda x: x['difficulty_rating'])
            
            return recommendations[:top_n]
            
        except Exception as e:
            print(f"❌ Error generating recommendations: {e}")
            return []
    
    def _check_prerequisites(self, prereqs, completed_courses):
        """Simple prerequisite checking logic"""
        if not prereqs or prereqs in ['NONE', '', 'NAN']:
            return True
        
        # Convert completed courses to uppercase for comparison
        completed_upper = [course.upper() for course in completed_courses]
        
        # Simple logic: if any of the completed courses appear in prerequisites
        for completed in completed_upper:
            if completed in prereqs:
                return True
        
        # Check for common prerequisite patterns
        if 'CSE 12' in prereqs and 'CSE 12' in completed_upper:
            return True
        if 'MATH 19A' in prereqs and 'MATH 19A' in completed_upper:
            return True
        
        return False
    
    def get_all_courses(self):
        """Return all available courses"""
        if self.courses_df is None:
            return []
        
        try:
            courses = []
            for _, row in self.courses_df.iterrows():
                courses.append({
                    'course_number': row['course_number'],
                    'tags': row.get('tags', ''),
                    'prerequisites': row.get('prerequisites', 'NONE'),
                    'quarters_offered': row.get('quarters_offered', ''),
                    'difficulty_rating': int(row.get('difficulty_rating', 3))
                })
            return courses
        except Exception as e:
            print(f"❌ Error getting courses: {e}")
            return []