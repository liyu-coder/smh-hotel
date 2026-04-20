import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Star,
  Users,
  Building,
  Briefcase,
  Award
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  position: string;
  location: string;
  headquarters: 'Brazil' | 'South Korea' | 'Singapore';
  image: string;
  bio: string;
  expertise: string[];
  email: string;
  linkedin?: string;
  twitter?: string;
  rating: number;
}

export function GlobalTeam() {
  const navigate = useNavigate();

  const teamMembers: TeamMember[] = [
    // Brazil Headquarters
    {
      id: 'br-001',
      name: 'Carlos Silva',
      position: 'Chief Executive Officer',
      location: 'São Paulo, Brazil',
      headquarters: 'Brazil',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Visionary leader with 15+ years in hospitality management, driving SMH\'s expansion across South America.',
      expertise: ['Strategic Planning', 'Operations', 'Business Development'],
      email: 'carlos.silva@smhglobal.com',
      linkedin: 'https://linkedin.com/in/carlossilva',
      twitter: '@carlos_silva_smh',
      rating: 4.9
    },
    {
      id: 'br-002',
      name: 'Isabella Costa',
      position: 'Head of Marketing',
      location: 'Rio de Janeiro, Brazil',
      headquarters: 'Brazil',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1c4?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Creative marketing expert specializing in luxury hospitality branding and digital transformation.',
      expertise: ['Brand Strategy', 'Digital Marketing', 'Content Creation'],
      email: 'isabella.costa@smhglobal.com',
      linkedin: 'https://linkedin.com/in/isabellacosta',
      rating: 4.8
    },
    {
      id: 'br-003',
      name: 'Roberto Mendes',
      position: 'Regional Director',
      location: 'Brasília, Brazil',
      headquarters: 'Brazil',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Experienced operations director overseeing SMH\'s Brazilian portfolio of 50+ luxury properties.',
      expertise: ['Operations Management', 'Quality Control', 'Team Leadership'],
      email: 'roberto.mendes@smhglobal.com',
      rating: 4.7
    },
    {
      id: 'br-004',
      name: 'Fernanda Lima',
      position: 'Finance Director',
      location: 'São Paulo, Brazil',
      headquarters: 'Brazil',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Financial strategist managing SMH\'s South American revenue streams and investment portfolios.',
      expertise: ['Financial Planning', 'Risk Management', 'Investment Analysis'],
      email: 'fernanda.lima@smhglobal.com',
      linkedin: 'https://linkedin.com/in/fernandalima',
      rating: 4.9
    },

    // South Korea Headquarters
    {
      id: 'kr-001',
      name: 'Kim Min-jun',
      position: 'Chief Technology Officer',
      location: 'Seoul, South Korea',
      headquarters: 'South Korea',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Tech innovator leading SMH\'s digital transformation and AI-powered hospitality solutions.',
      expertise: ['Technology Strategy', 'AI Implementation', 'System Architecture'],
      email: 'kim.minjun@smhglobal.com',
      linkedin: 'https://linkedin.com/in/kimminjun',
      rating: 4.9
    },
    {
      id: 'kr-002',
      name: 'Park Soo-jin',
      position: 'Head of Asian Operations',
      location: 'Busan, South Korea',
      headquarters: 'South Korea',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1c4?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Strategic operations leader managing SMH\'s expansion across Asian markets with focus on luxury experiences.',
      expertise: ['Operations Strategy', 'Market Expansion', 'Cultural Integration'],
      email: 'park.soojin@smhglobal.com',
      rating: 4.8
    },
    {
      id: 'kr-003',
      name: 'Lee Dong-hyun',
      position: 'Product Development Director',
      location: 'Seoul, South Korea',
      headquarters: 'South Korea',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Innovative product developer creating cutting-edge hospitality experiences for the Asian market.',
      expertise: ['Product Design', 'User Experience', 'Innovation Strategy'],
      email: 'lee.donghyun@smhglobal.com',
      linkedin: 'https://linkedin.com/in/leedonghyun',
      rating: 4.7
    },
    {
      id: 'kr-004',
      name: 'Choi Ji-eun',
      position: 'Customer Experience Director',
      location: 'Incheon, South Korea',
      headquarters: 'South Korea',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Customer experience expert ensuring exceptional service across SMH\'s Asian properties.',
      expertise: ['Customer Service', 'Experience Design', 'Quality Assurance'],
      email: 'choi.jieun@smhglobal.com',
      rating: 4.8
    },

    // Singapore Headquarters
    {
      id: 'sg-001',
      name: 'Tan Wei Ming',
      position: 'Chief Financial Officer',
      location: 'Singapore',
      headquarters: 'Singapore',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Financial expert managing SMH\'s global financial strategy and Southeast Asian market operations.',
      expertise: ['Financial Strategy', 'Investment Management', 'Risk Assessment'],
      email: 'tan.weiming@smhglobal.com',
      linkedin: 'https://linkedin.com/in/tanweiming',
      rating: 4.9
    },
    {
      id: 'sg-002',
      name: 'Lim Mei Ling',
      position: 'Head of Global Partnerships',
      location: 'Singapore',
      headquarters: 'Singapore',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b332c1c4?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Partnership specialist building strategic alliances with luxury brands and hospitality partners worldwide.',
      expertise: ['Partnership Development', 'Strategic Alliances', 'Business Development'],
      email: 'lim.meiling@smhglobal.com',
      linkedin: 'https://linkedin.com/in/limmeiling',
      rating: 4.8
    },
    {
      id: 'sg-003',
      name: 'Nguyen Anh Tuan',
      position: 'Regional Director - Southeast Asia',
      location: 'Singapore',
      headquarters: 'Singapore',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Regional director overseeing SMH\'s expansion and operations across Southeast Asian markets.',
      expertise: ['Regional Management', 'Market Entry Strategy', 'Operations Excellence'],
      email: 'nguyen.anhtuan@smhglobal.com',
      linkedin: 'https://linkedin.com/in/nguyenanhtuan',
      rating: 4.7
    },
    {
      id: 'sg-004',
      name: 'Rachel Chen',
      position: 'Head of Sustainability',
      location: 'Singapore',
      headquarters: 'Singapore',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&face=1',
      bio: 'Sustainability champion implementing eco-friendly practices across SMH\'s global portfolio.',
      expertise: ['Sustainability Strategy', 'Environmental Management', 'Green Initiatives'],
      email: 'rachel.chen@smhglobal.com',
      linkedin: 'https://linkedin.com/in/rachelchen',
      rating: 4.9
    }
  ];

  const headquarters = [
    {
      country: 'Brazil',
      city: 'São Paulo',
      flag: 'BR',
      description: 'South American Operations Hub',
      members: teamMembers.filter(m => m.headquarters === 'Brazil'),
      color: 'from-green-500 to-yellow-500'
    },
    {
      country: 'South Korea',
      city: 'Seoul',
      flag: 'KR',
      description: 'Technology & Innovation Center',
      members: teamMembers.filter(m => m.headquarters === 'South Korea'),
      color: 'from-blue-500 to-red-500'
    },
    {
      country: 'Singapore',
      city: 'Singapore',
      flag: 'SG',
      description: 'Global Financial Hub',
      members: teamMembers.filter(m => m.headquarters === 'Singapore'),
      color: 'from-red-500 to-white'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
              Global Leadership Team
            </h1>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 mb-4"
            >
              <Globe className="w-8 h-8" />
              <span className="text-2xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                SMH Global Headquarters
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
              style={{ fontFamily: 'Montserrat' }}
            >
              Leading Hospitality Innovation Worldwide
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl opacity-90 max-w-3xl mx-auto"
              style={{ fontFamily: 'Inter' }}
            >
              Our global leadership team operates from three strategic headquarters, bringing together diverse expertise to deliver exceptional hospitality experiences across continents.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Headquarters Sections */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {headquarters.map((hq, index) => (
          <motion.div
            key={hq.country}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="mb-16"
          >
            {/* Headquarters Header */}
            <div className={`bg-gradient-to-r ${hq.color} rounded-2xl p-8 mb-8 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="text-6xl font-bold">{hq.flag}</div>
                    <div>
                      <h2 className="text-3xl font-bold" style={{ fontFamily: 'Montserrat' }}>
                        {hq.country} Headquarters
                      </h2>
                      <p className="text-xl opacity-90" style={{ fontFamily: 'Inter' }}>
                        {hq.city} - {hq.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <Building className="w-5 h-5" />
                    <span className="text-sm opacity-90" style={{ fontFamily: 'Inter' }}>
                      {hq.members.length} Team Members
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-2">{hq.members.length}</div>
                  <div className="text-sm opacity-90">Professionals</div>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hq.members.map((member, memberIndex) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 + memberIndex * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-64">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span>{member.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1" style={{ fontFamily: 'Montserrat' }}>
                      {member.name}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium mb-2" style={{ fontFamily: 'Inter' }}>
                      {member.position}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span style={{ fontFamily: 'Inter' }}>{member.location}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2" style={{ fontFamily: 'Inter' }}>
                      {member.bio}
                    </p>
                    
                    {/* Expertise */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.expertise.slice(0, 2).map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                          style={{ fontFamily: 'Inter' }}
                        >
                          {skill}
                        </div>
                      ))}
                    </div>

                    {/* Contact */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600" style={{ fontFamily: 'Inter' }}>
                            {member.email.split('@')[0]}@...
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Linkedin className="w-4 h-4" />
                            </a>
                          )}
                          {member.twitter && (
                            <a
                              href={`https://twitter.com/${member.twitter.replace('@', '')}`}
                              className="text-blue-400 hover:text-blue-500 transition-colors"
                            >
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat' }}>
              Global Impact by Numbers
            </h2>
            <p className="text-xl opacity-90" style={{ fontFamily: 'Inter' }}>
              Our team delivers excellence across three continents
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-sm opacity-80">Global Leaders</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">3</div>
              <div className="text-sm opacity-80">Continental HQs</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-sm opacity-80">Properties Managed</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold mb-2">4.8</div>
              <div className="text-sm opacity-80">Average Rating</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Montserrat' }}>
            Join Our Global Team
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter' }}>
            Be part of a world-class team delivering exceptional hospitality experiences across the globe.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2" style={{ fontFamily: 'Montserrat' }}>
              <Briefcase className="w-4 h-4" />
              View Careers
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-colors flex items-center gap-2" style={{ fontFamily: 'Montserrat' }}>
              <Mail className="w-4 h-4" />
              Contact Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
