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
        </form>
      </div>
    </div>
  );
};

export default EditSkill;