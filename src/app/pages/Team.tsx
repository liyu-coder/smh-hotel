import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Mail, Phone, MapPin, Award, Briefcase, Calendar, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Team() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Chief Executive Officer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      email: 'sarah.johnson@smh.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      bio: 'Leading SMH with over 15 years of experience in luxury hospitality and technology.',
      expertise: ['Strategic Planning', 'Business Development', 'Leadership'],
      awards: ['CEO of the Year 2023', 'Innovation in Hospitality Award'],
      joined: '2019'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      email: 'michael.chen@smh.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, USA',
      bio: 'Driving technological innovation with expertise in AI, machine learning, and scalable systems.',
      expertise: ['AI & Machine Learning', 'Cloud Architecture', 'Product Development'],
      awards: ['Tech Innovator 2023', 'Best CTO Award'],
      joined: '2020'
    },
    {
      id: 3,
      name: 'Emma Martinez',
      role: 'Chief Operating Officer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      email: 'emma.martinez@smh.com',
      phone: '+1 (555) 345-6789',
      location: 'London, UK',
      bio: 'Ensuring operational excellence across all SMH properties and services worldwide.',
      expertise: ['Operations Management', 'Quality Assurance', 'Process Optimization'],
      awards: ['Operations Excellence 2023', 'Quality Leadership Award'],
      joined: '2018'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Head of Marketing',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      email: 'david.kim@smh.com',
      phone: '+1 (555) 456-7890',
      location: 'Seoul, South Korea',
      bio: 'Creating compelling marketing strategies that connect SMH with luxury travelers globally.',
      expertise: ['Digital Marketing', 'Brand Strategy', 'Customer Experience'],
      awards: ['Marketing Excellence 2023', 'Brand Builder Award'],
      joined: '2021'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Head of Customer Experience',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      email: 'lisa.thompson@smh.com',
      phone: '+1 (555) 567-8901',
      location: 'Dubai, UAE',
      bio: 'Dedicated to providing exceptional customer service and support for all SMH clients.',
      expertise: ['Customer Service', 'User Experience', 'Support Operations'],
      awards: ['Customer Service Leader 2023', 'CX Innovation Award'],
      joined: '2020'
    },
    {
      id: 6,
      name: 'James Wilson',
      role: 'Head of Partnerships',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      email: 'james.wilson@smh.com',
      phone: '+1 (555) 678-9012',
      location: 'Singapore',
      bio: 'Building strategic partnerships with luxury hotels and hospitality brands worldwide.',
      expertise: ['Business Development', 'Partnership Management', 'Negotiation'],
      awards: ['Partnership Excellence 2023', 'Business Development Leader'],
      joined: '2019'
    }
  ];

  const companyStats = [
    { label: 'Team Members', value: '50+', icon: Users },
    { label: 'Countries', value: '25+', icon: MapPin },
    { label: 'Years Experience', value: '75+', icon: Award },
    { label: 'Happy Clients', value: '10K+', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/home" className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
            SMH
          </Link>
          <Link to="/home" className="flex items-center gap-2 text-gray-600 hover:text-[#D4AF37]">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
            Meet Our Team
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            The passionate individuals behind SMH, dedicated to revolutionizing luxury hotel reservations
          </p>
        </motion.div>

        {/* Company Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {companyStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: '#D4AF37' }} />
              <div className="text-2xl font-bold mb-1" style={{ color: '#1a1a1a' }}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Team Member Header */}
              <div className="relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-xl font-bold text-white">{member.name}</h3>
                  <p className="text-white/90">{member.role}</p>
                </div>
              </div>

              {/* Team Member Details */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 text-sm">{member.bio}</p>
                
                {/* Expertise */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-sm" style={{ color: '#1a1a1a' }}>
                    Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: '#D4AF3720', color: '#D4AF37' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Awards */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-sm flex items-center gap-2" style={{ color: '#1a1a1a' }}>
                    <Award className="w-4 h-4" style={{ color: '#D4AF37' }} />
                    Awards
                  </h4>
                  <div className="space-y-1">
                    {member.awards.map((award, awardIndex) => (
                      <div key={awardIndex} className="text-xs text-gray-600 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {award}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {member.joined}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join Our Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 bg-gradient-to-r from-[#D4AF37] to-[#E5C551] rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Want to Join Our Team?</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about hospitality and technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-[#D4AF37] px-6 py-3 rounded-lg font-semibold"
            >
              View Open Positions
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#D4AF37] transition-colors"
            >
              Send Your Resume
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
