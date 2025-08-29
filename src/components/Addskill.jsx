import React, { useState, useCallback, useEffect } from 'react';
import { Star, Upload, X, CheckCircle, AlertCircle, Loader, Sparkles, ChevronRight } from 'lucide-react';
import axios from "axios";

const AddSkill = () => {
  // Mock user for demo
  const user = { id: 1 };

  const [form, setForm] = useState({
    skill_name: '',
    category: '',
    description: '',
    difficulty: 'Beginner',
    proficiency: 3,
    years_experience: 1,
    skill_photo: null
  });

  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const categories = [
    'Programming', 'Design', 'Marketing', 'Photography', 'Music', 'Cooking',
    'Languages', 'Writing', 'Sports', 'Fitness', 'Art', 'Crafts', 'Business',
    'Finance', 'Education', 'Health', 'Technology', 'Engineering', 'Science',
    'Gardening', 'DIY', 'Gaming', 'Acting', 'Dancing', 'Other'
  ];

  const difficultyColors = {
    'Beginner': 'from-green-400 to-emerald-500',
    'Intermediate': 'from-blue-400 to-cyan-500',
    'Advanced': 'from-purple-400 to-violet-500',
    'Expert': 'from-orange-400 to-red-500'
  };

  // Calculate progress based on form completion
  const calculateProgress = useCallback(() => {
    let completedFields = 0;
    const totalFields = 6; // skill_name, category, description, difficulty, proficiency, years_experience

    if (form.skill_name.trim()) completedFields++;
    if (form.category) completedFields++;
    if (form.description.trim()) completedFields++;
    if (form.difficulty) completedFields++;
    if (form.proficiency > 0) completedFields++;
    if (form.years_experience >= 0) completedFields++;

    const progressPercentage = Math.round((completedFields / totalFields) * 100);
    setProgress(progressPercentage);
  }, [form]);

  useEffect(() => {
    calculateProgress();
  }, [calculateProgress]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (status.error || status.success) {
      setStatus({ error: '', success: '' });
    }
  }, [status.error, status.success]);

  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return 'File size should be less than 5MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or WebP)';
    }

    return null;
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setStatus({ error, success: '' });
      return;
    }

    setForm(prev => ({ ...prev, skill_photo: file }));
    setPreview(URL.createObjectURL(file));
    setStatus({ error: '', success: '' });
  }, []);

  const removeImage = useCallback(() => {
    setForm(prev => ({ ...prev, skill_photo: null }));
    setPreview('');
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [preview]);

  const handleSubmit = async () => {
    setStatus({ error: '', success: '' });
    setIsSubmitting(true);

    // Validate required fields
    if (!form.skill_name.trim() || !form.category || !form.description.trim()) {
      setStatus({ error: 'Please fill in all required fields' });
      setIsSubmitting(false);
      return;
    }

    if (form.skill_name.length < 2) {
      setStatus({ error: 'Skill name must be at least 2 characters' });
      setIsSubmitting(false);
      return;
    }

    if (form.description.length < 10) {
      setStatus({ error: 'Description must be at least 10 characters' });
      setIsSubmitting(false);
      return;
    }

    // Simulate form data creation and API call
    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('skill_name', form.skill_name);
      formData.append('category', form.category);
      formData.append('description', form.description);
      formData.append('difficulty', form.difficulty);
      formData.append('proficiency', form.proficiency);
      formData.append('years_experience', form.years_experience);
      if (form.skill_photo) {
        formData.append('skill_photo', form.skill_photo);
      }

      // Simulate API call with delay
      const res = await axios.post(
        "https://muterianc.pythonanywhere.com//api/add_skill", // replace with your backend URL
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );


      setStatus({ success: 'Skill added successfully! 🎉' });

      // Reset form
      setForm({
        skill_name: '',
        category: '',
        description: '',
        difficulty: 'Beginner',
        proficiency: 3,
        years_experience: 1,
        skill_photo: null
      });
      setPreview('');
      setProgress(0);
    } catch (err) {
      setStatus({ error: 'Failed to add skill. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressColor = () => {
    if (progress < 30) return 'from-red-400 to-red-500';
    if (progress < 70) return 'from-yellow-400 to-orange-500';
    return 'from-green-400 to-emerald-500';
  };

  const getProgressMessage = () => {
    if (progress === 0) return 'Let\'s get started!';
    if (progress < 30) return 'Just getting started...';
    if (progress < 70) return 'Making good progress!';
    if (progress < 100) return 'Almost there!';
    return 'Ready to submit!';
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <Navbar />

      <div className="h-16"></div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Add New Skill
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your expertise with the community and help others learn something amazing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Completion Progress</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{getProgressMessage()}</span>
            </div>
            <span className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full">
              {progress}%
            </span>
          </div>

          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {progress === 100 && (
            <div className="mt-3 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">All required fields completed!</span>
            </div>
          )}
        </div>

        {/* Status Messages */}
        {status.error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-red-700 font-medium">{status.error}</span>
            </div>
          </div>
        )}

        {status.success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-green-700 font-medium">{status.success}</span>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 md:p-10">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Skill Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="skill_name"
                    type="text"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 placeholder-gray-400"
                    value={form.skill_name}
                    onChange={handleChange}
                    placeholder="e.g. Web Development, Graphic Design"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 placeholder-gray-400 resize-none"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your skill, experience, and what you can offer to help others learn..."
                  required
                />
                <div className="text-right">
                  <span className={`text-xs ${form.description.length < 10 ? 'text-red-500' : 'text-green-500'}`}>
                    {form.description.length}/10 minimum characters
                  </span>
                </div>
              </div>
            </div>

            {/* Skill Details Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Skill Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Difficulty Level</label>
                  <div className="relative">
                    <select
                      name="difficulty"
                      className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 appearance-none"
                      value={form.difficulty}
                      onChange={handleChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <div className={`absolute top-3 right-12 w-3 h-3 rounded-full bg-gradient-to-r ${difficultyColors[form.difficulty]}`}></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Proficiency Level</label>
                  <div className="flex items-center gap-2 p-3 bg-white/50 border-2 border-gray-200 rounded-xl">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setForm({ ...form, proficiency: star })}
                          className="p-1 focus:outline-none transition-all duration-200 transform hover:scale-125"
                          aria-label={`Rate ${star} star`}
                        >
                          <Star
                            size={24}
                            className={
                              star <= form.proficiency
                                ? 'text-yellow-400 fill-current drop-shadow-sm'
                                : 'text-gray-300 hover:text-yellow-300'
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {form.proficiency}/5
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Years Experience</label>
                  <input
                    name="years_experience"
                    type="number"
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300"
                    value={form.years_experience}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Visual Representation
                <span className="text-sm text-gray-500 ml-2">(Optional)</span>
              </h2>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Skill Photo</label>
                <p className="text-sm text-gray-500">
                  Upload an image that represents your skill (optional, max 5MB)
                </p>

                {preview ? (
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-64 w-full object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label="Remove image"
                    >
                      <X size={20} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300 group">
                    <div className="flex flex-col items-center p-6">
                      <div className="p-4 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-300">
                        <Upload size={32} className="text-blue-500" />
                      </div>
                      <span className="text-gray-600 font-medium mt-3">Click to upload an image</span>
                      <span className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG, WebP (max 5MB)</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || progress < 50}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader className="w-5 h-5 animate-spin" />
                    Adding Skill...
                  </div>
                ) : progress < 50 ? (
                  <div className="flex items-center justify-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    Complete More Fields to Continue
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    Add My Skill
                  </div>
                )}
              </button>

              {progress < 50 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Fill in at least 50% of the form to enable submission
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSkill;