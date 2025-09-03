'use client';
import Image from 'next/image';
import { COLORS, SCHOOL_INFO } from '@/constants/colors';

export default function AboutSection() {
  const stats = [
    { number: '2500+', label: 'Students' },
    { number: '150+', label: 'Teachers' },
    { number: '25+', label: 'Years of Excellence' },
    { number: '95%', label: 'Success Rate' },
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary[700] }}>
            About {SCHOOL_INFO.name}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Established in {SCHOOL_INFO.established}, we have been at the forefront of educational excellence, 
            nurturing young minds and shaping future leaders.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold mb-6" style={{ color: COLORS.primary[600] }}>
              Our Mission
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              To provide world-class education that empowers students to become confident, 
              creative, and responsible global citizens. We believe in fostering an environment 
              where every student can discover their potential and pursue their passions.
            </p>
            <p className="text-lg text-gray-700">
              Our comprehensive curriculum combines academic excellence with character development, 
              ensuring our graduates are well-prepared for the challenges of tomorrow.
            </p>
          </div>
          <div className="relative">
            <Image
              src="https://ik.imagekit.io/edustack/edustack/Whisk_15e2fc5166.jpg" 
              alt="School building"
              width={600} 
              height={400}
              className="rounded-lg shadow-xl"
            />
            <div 
              className="absolute -bottom-6 -right-6 w-32 h-32 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: COLORS.primary[500] }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold">{SCHOOL_INFO.established}</div>
                <div className="text-sm">Established</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color: COLORS.primary[600] }}
              >
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}