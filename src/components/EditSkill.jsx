import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const EditSkill = () => {
  const { id } = useParams();
  const { user, token } = useAuth(); // Make sure your AuthContext provides the token
  const navigate = useNavigate();

  const [skillData, setSkillData] = useState({
    skill_name: '',
    category: '',
    description: '',
    difficulty: '',
    proficiency: 1,
    years_experience: 0,
    skill_photo: null
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch skill data by ID with authorization
    axios.get(`https://muterianc.pythonanywhere.com/api/skill/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setSkillData(res.data.skill);
      })
      .catch(err => {
        console.error("Error fetching skill:", err);
        setError("Failed to load skill");
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setSkillData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setSkillData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      for (let key in skillData) {
        // Don't send user_id in form data - backend gets it from token
        if (skillData[key] !== null && key !== 'user_id') {
          formData.append(key, skillData[key]);
        }
      }

      await axios.put(`https://muterianc.pythonanywhere.com/api/edit_skill/${id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      alert("Skill updated successfully!");
      navigate('/skills');
    } catch (err) {
      console.error("Error updating skill:", err);
      alert("Failed to update skill.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="container my-5">
        <h2 className="mb-4 text-primary">Edit Skill</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* ... rest of your form remains the same ... */}

          <div className="mb-3">
            <label className="form-label">Skill Name</label>
            <input
              type="text"
              className="form-control"
              name="skill_name"
              value={skillData.skill_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-control"
              name="category"
              value={skillData.category}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={skillData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Difficulty</label>
            <select
              className="form-select"
              name="difficulty"
              value={skillData.difficulty}
              onChange={handleChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Proficiency</label>
            <input
              type="number"
              className="form-control"
              name="proficiency"
              value={skillData.proficiency}
              onChange={handleChange}
              min={1}
              max={10}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              className="form-control"
              name="years_experience"
              value={skillData.years_experience}
              onChange={handleChange}
              min={0}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Skill Photo</label>
            <input
              type="file"
              className="form-control"
              name="skill_photo"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success">Update Skill</button>
        </form>
      </div>
    </div>
  );
};

export default EditSkill;