import React, { useState, useEffect, useMemo } from 'react'; // ADDED useMemo
import { Brain, CheckSquare, Target, User, BookOpen, Award } from 'lucide-react';

const App = () => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);

  // courseData is now memoized to prevent re-creation on every render
  const courseData = useMemo(() => [ // WRAPPED WITH useMemo
    { course_number: 'CSE 3', tags: 'intro', prerequisites: 'NONE', quarters_offered: 'Fall, Winter, Spring', difficulty_rating: 1 },
    { course_number: 'CSE 12', tags: 'systems', prerequisites: 'CSE 5J or CSE 20 or CSE 30 or BME 160', quarters_offered: 'Fall, Winter, Spring', difficulty_rating: 2 },
    { course_number: 'CSE 13S', tags: 'programming', prerequisites: 'CSE 12 or BME 160', quarters_offered: 'Fall, Winter, Spring', difficulty_rating: 3 },
    { course_number: 'CSE 16', tags: 'theory', prerequisites: 'MATH 19A or MATH 19B or MATH 11B or AM 11B or AM 15B or Econ 11B', quarters_offered: 'Fall, Winter, Spring', difficulty_rating: 2 },
    { course_number: 'CSE 101', tags: 'algorithms', prerequisites: 'CSE 12, CSE 13S', quarters_offered: 'Fall, Winter, Spring', difficulty_rating: 4 },
    { course_number: 'CSE 120', tags: 'systems', prerequisites: 'CSE 12', quarters_offered: 'Fall, Spring', difficulty_rating: 3 },
    { course_number: 'CSE 130', tags: 'systems', prerequisites: 'CSE 12, CSE 13S', quarters_offered: 'Winter, Spring', difficulty_rating: 4 }
  ], []); // ADDED DEPENDENCY ARRAY FOR useMemo

  const majors = [ // Renamed from graduatePrograms
    { id: 'AM-GRAD', name: 'Applied Mathematics Graduate Program' },
    { id: 'BME-GRAD', name: 'Biomolecular Engineering Graduate Program' },
    { id: 'CM-GRAD', name: 'Computational Media Graduate Program' },
    { id: 'ECE-GRAD', name: 'Electrical and Computer Engineering Graduate Program' },
    { id: 'CPM-GRAD', name: 'Games and Playable Media Graduate Program' },
    { id: 'HCI-GRAD', name: 'Human Computer Interaction Graduate Program' }
  ];

  // Load real courses from API when component mounts
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // USE ENV VARIABLE FOR BACKEND URL
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/courses`);
        const data = await response.json();

        if (data.status === 'success') {
          const courseNumbers = data.courses.map(course => course.course_number);
          setAvailableCourses(courseNumbers);
        } else {
          setAvailableCourses(courseData.map(course => course.course_number));
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        setAvailableCourses(courseData.map(course => course.course_number));
      }
    };

    loadCourses();
  }, [courseData]); // courseData is correctly in dependency array

  const exampleProfiles = [
    {
      name: 'CS Junior',
      completed: ['CSE 12', 'CSE 13S', 'MATH 19A', 'MATH 19B'],
      major: 'Computer Science',
      gpa: '3.7'
    },
    {
      name: 'Math Sophomore', 
      completed: ['MATH 19A', 'MATH 19B', 'STAT 131'],
      major: 'Mathematics',
      gpa: '3.9'
    }
  ];

  const handleCourseToggle = (course) => {
    setSelectedCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const selectAll = () => setSelectedCourses([...availableCourses]);
  const clearAll = () => setSelectedCourses([]);
  const selectRecommended = () => setSelectedCourses(['CSE 12', 'CSE 13S', 'MATH 19A', 'MATH 19B']);
  const loadExampleProfile = (profile) => setSelectedCourses(profile.completed);

  const getRecommendations = async () => {
    setLoading(true);

    try {
      // USE ENV VARIABLE FOR BACKEND URL
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed_courses: selectedCourses,
          preferences: {
            interests: 'machine learning, algorithms, programming',
            major: 'Computer Science',
            skill_level: 'intermediate'
          },
          top_n: 5
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setRecommendations(data.recommendations);
      } else {
        console.error('API Error:', data.error);
        alert('Error getting recommendations: ' + data.error);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Error connecting to backend: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: '#2563eb',
        color: 'white',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        padding: '16px 0'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={32} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>UCSC Course Recommender</h1>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1d4ed8',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}>
              🏠 Home
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1d4ed8',
              border: 'none',
              color: 'white',
              cursor: 'pointer'
            }}>
              📊 Model Performance
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Brain size={64} color="#2563eb" />
          </div>
          <h2 style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Get Personalized Course Recommendations
          </h2>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            maxWidth: '768px', 
            margin: '0 auto'
          }}>
            Our AI-powered system analyzes your academic profile to recommend the best courses for your next quarter
          </p>
        </div>

        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px', 
          marginBottom: '48px' 
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            textAlign: 'center'
          }}>
            <Brain size={48} color="#2563eb" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>AI-Powered</h3>
            <p style={{ color: '#6b7280' }}>
              Uses Random Forest machine learning to predict course availability and match your interests
            </p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            textAlign: 'center'
          }}>
            <CheckSquare size={48} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Prerequisite Aware</h3>
            <p style={{ color: '#6b7280' }}>
              Automatically checks prerequisites and recommends courses you're ready to take
            </p>
          </div>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            textAlign: 'center'
          }}>
            <Target size={48} color="#7c3aed" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Personalized</h3>
            <p style={{ color: '#6b7280' }}>
              Considers your major, GPA, and academic history for tailored recommendations
            </p>
          </div>
        </div>

        {/* Student Profile Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <User size={24} color="#2563eb" style={{ marginRight: '12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Student Profile</h3>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <CheckSquare size={20} color="#2563eb" style={{ marginRight: '8px' }} />
              <h4 style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>Completed Courses</h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              <button 
                onClick={selectAll}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ✓ Select All
              </button>
              <button 
                onClick={clearAll}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ✗ Clear All
              </button>
              <button 
                onClick={selectRecommended}
                style={{
                  padding: '8px 16px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ⭐ Select Recommended
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              {majors.map((program) => (
                <div key={program.id} style={{ textAlign: 'center' }}>
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}>
                    <h5 style={{ fontWeight: '600', color: '#2563eb', marginBottom: '4px', fontSize: '14px' }}>
                      {program.id}
                    </h5>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{program.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              Select all courses you have already completed:
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
              gap: '8px' 
            }}>
              {availableCourses.map((course) => (
                <button
                  key={course}
                  onClick={() => handleCourseToggle(course)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedCourses.includes(course) ? '#2563eb' : '#f3f4f6',
                    color: selectedCourses.includes(course) ? 'white' : '#374151'
                  }}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={getRecommendations}
            disabled={loading || selectedCourses.length === 0}
            style={{
              width: '100%',
              background: selectedCourses.length === 0 ? '#9ca3af' : '#2563eb',
              color: 'white',
              fontWeight: '600',
              padding: '16px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? 'Analyzing Your Profile...' : 'Get Personalized Recommendations'}
          </button>
        </div>

        {/* Example Profiles */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <Award size={24} color="#2563eb" style={{ marginRight: '12px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Example Student Profiles</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {exampleProfiles.map((profile, index) => (
              <div key={index} style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <User size={20} color="#2563eb" style={{ marginRight: '8px' }} />
                  <h4 style={{ fontWeight: '600', fontSize: '18px', margin: 0 }}>{profile.name}</h4>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <strong>Completed:</strong> {profile.completed.join(', ')}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  <strong>Major:</strong> {profile.major}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                  <strong>GPA:</strong> {profile.gpa}
                </p>
                <button
                  onClick={() => loadExampleProfile(profile)}
                  style={{
                    width: '100%',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Load This Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '32px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
              Recommended Courses for You
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recommendations.map((course, index) => (
                <div key={index} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: '600', color: '#2563eb', margin: 0 }}>
                      {course.course_number}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '18px',
                            color: i < course.difficulty_rating ? '#fbbf24' : '#d1d5db'
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                    <strong>Prerequisites:</strong> {course.prerequisites}
                  </p>
                  <p style={{ color: '#6b7280', marginBottom: '8px' }}>
                    <strong>Offered:</strong> {course.quarters_offered}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      borderRadius: '16px',
                      fontSize: '14px'
                    }}>
                      {course.tags}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '48px', textAlign: 'center', color: '#6b7280' }}>
          <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <BookOpen size={20} />
            <span>UCSC Course Recommender - Powered by Machine Learning</span>
          </p>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Using Random Forest Classification</p>
        </div>
      </div>
    </div>
  );
};

export default App;
