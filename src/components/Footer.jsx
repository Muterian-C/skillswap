import { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Footer = () => {
  // State management for form inputs and feedback
  const [email, setEmail] = useState(''); // Stores user email input
  const [comment, setComment] = useState(''); // Stores user comment input
  const [feedback, setFeedback] = useState(''); // Stores feedback message
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
  const [isSubmitting, setIsSubmitting] = useState(false); // Form submission state

  // Social media links configuration
  const socialLinks = [
    { 
      name: 'Twitter', 
      url: 'https://x.com/skill_sw_ap?t=NoplyPGklvHUoG_snvcONA&s=09', 
      icon: '𝕏', 
      color: 'hover:bg-black hover:border-black' 
    },
    { 
      name: 'Facebook', 
      url: 'https://facebook.com', 
      icon: 'f', 
      color: 'hover:bg-blue-600 hover:border-blue-600' 
    },
    { 
      name: 'Instagram', 
      url: 'https://www.instagram.com/skill_sw_ap?igsh=YzljYTk1ODg3Zg==', 
      icon: '📷', 
      color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 hover:border-transparent' 
    },
    { 
      name: 'LinkedIn', 
      url: 'https://linkedin.com', 
      icon: 'in', 
      color: 'hover:bg-blue-700 hover:border-blue-700' 
    }
  ];

  /**
   * Handles form submission for comments
   */
  const submitComment = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
    // Basic validation
    if (!email || !comment) {
      setFeedback('Please fill in all fields.');
      setFeedbackType('error');
      return;
    }
    
    setIsSubmitting(true);
    setFeedback('');
    setFeedbackType('');

    try {
      // Simulate API call (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful submission
      setFeedback('Thank you for your feedback! We\'ll get back to you soon.');
      setFeedbackType('success');
      setEmail('');
      setComment('');
    } catch (err) {
      // On error
      setFeedback('Failed to submit comment. Please try again.');
      setFeedbackType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          
          {/* About Us Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold">S</span>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                SkillSwap
              </h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              We're passionate about connecting people through practical skills. 
              Whether you're learning or teaching, this is your community hub for growth and collaboration.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active Community</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-400" />
                <span>Trusted Platform</span>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="text-blue-400" size={24} />
              <h3 className="text-2xl font-bold">Get In Touch</h3>
            </div>
            
            <form onSubmit={submitComment} className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           group-hover:border-slate-600"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
              
              {/* Comment Textarea */}
              <div className="relative group">
                <textarea
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all duration-300
                           group-hover:border-slate-600 resize-none"
                  placeholder="Share your thoughts or questions..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  required
                />
                <MessageSquare className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 
                         rounded-xl font-semibold text-white transition-all duration-300 
                         hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                         flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending message...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
              
              {/* Feedback Message */}
              {feedback && (
                <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium
                  ${feedbackType === 'success' 
                    ? 'bg-green-900/30 border border-green-700 text-green-300' 
                    : 'bg-red-900/30 border border-red-700 text-red-300'
                  }`}>
                  {feedbackType === 'success' ? 
                    <CheckCircle size={16} /> : 
                    <AlertCircle size={16} />
                  }
                  <span>{feedback}</span>
                </div>
              )}
            </form>
          </div>

          {/* Social Media Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6">Stay Connected</h3>
            
            {/* Social Links */}
            <div className="grid grid-cols-2 gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700 
                           rounded-xl transition-all duration-300 hover:border-slate-600 
                           hover:bg-slate-700/30 hover:shadow-lg group ${social.color}`}
                >
                  <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center 
                                text-lg font-bold group-hover:scale-110 transition-transform">
                    {social.icon}
                  </div>
                  <span className="font-medium group-hover:text-white transition-colors">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
            
            <div className="p-4 bg-slate-800/20 border border-slate-700 rounded-xl">
              <p className="text-gray-300 text-sm leading-relaxed">
                Join our community across all platforms. Get updates, share experiences, 
                and connect with fellow skill enthusiasts.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-8"></div>

        {/* Copyright Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-xs font-bold">
              M
            </div>
            <span>&copy; {new Date().getFullYear()} MuterianC. All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
