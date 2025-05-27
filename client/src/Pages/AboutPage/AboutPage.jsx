import React from "react";
import aboutImage from "../../assets/aboutImage.jpg";
import { Link } from "react-router";

const AboutPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 text-gray-800 mt-32">
      {/* Top Banner Section with Background Image (No Overlay) */}
      <div
        className="relative min-h-[450px] w-full rounded-xl overflow-hidden shadow-lg mb-12"
        style={{
          backgroundImage: `url(${aboutImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center items-start h-full px-4 sm:px-8 md:px-16 max-w-4xl text-highlight">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Lordland University
          </h1>
          <p className="text-lg italic mb-2">
            "Beloved, I pray that all may go well with you and that you may be
            in good health, as it goes well with your soul." (3 John 1:2)
          </p>
          <p className="text-base">
            Lordland University is founded with the motto of “let's go to the
            Power Life!”, and has been aspiring and developing the potential
            powers that lie in its core. I am honored and proud to lead this
            remarkable institution.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="px-4 sm:px-6 md:px-8 py-6">
        <h2 className="text-3xl font-semibold mb-2">Our Mission</h2>
        <blockquote className="italic text-indigo-700 mb-4">
          "Therefore go and make disciples of all nations..." (Matthew 28:19-20)
        </blockquote>
        <p>
          Our mission is to offer exemplary education through our undergraduate
          and graduate degrees in Theology, Religious Education, and Missiology.
          We strive to cultivate in students:
        </p>
        <ul className="list-disc ml-6 space-y-1 mt-2">
          <li>
            Intellectual and academic integrity, along with informal ethical
            values
          </li>
          <li>Tolerance of social differences and diversity of cultures</li>
          <li>
            Creativity in critical thinking and intellectual problem-solving
          </li>
          <li>Personal, professional, and social leadership skills</li>
          <li>A sense of personal joy and fulfillment</li>
          <li>
            Sensitivity to the needs of others and commitment to the betterment
            of humanity
          </li>
        </ul>
      </section>

      {/* Educational Philosophy */}
      <section className="px-4 sm:px-6 md:px-8 py-6">
        <h2 className="text-3xl font-semibold mb-2">Educational Philosophy</h2>
        <p>
          The founding philosophy of Lordland University is to provide quality
          education in the fields of Theology, Divinity, Missiology, and
          Religious Education. Our educational experiences are fostered by
          personal relationships and the exchange of ideas between students and
          faculty.
        </p>
        <p className="mt-2">Our commitment to excellence is reflected in:</p>
        <ul className="list-disc ml-6 space-y-1 mt-2">
          <li>Effective teaching and high standards of scholarship</li>
          <li>Ongoing professional development for faculty and staff</li>
          <li>Encouraging intellectual curiosity and creativity</li>
          <li>Maintaining a nurturing and academically rigorous environment</li>
        </ul>
      </section>

      {/* Campus Location */}
      <section className="px-4 sm:px-6 md:px-8 py-6">
        <h2 className="text-3xl font-semibold mb-2">Campus Location</h2>
        <p>
          Located in the heart of Los Angeles, between Downtown LA and
          Koreatown. Attractions nearby include Universal Studios, Hollywood,
          Disneyland, and more.
        </p>
        <p className="mt-2 font-semibold">
          Address: 119 Belmont Ave, Los Angeles, CA 90026
        </p>
        <div className="mt-4">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.033117347931!2d-118.26584792344235!3d34.06823311726725!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2c7bbbe00f015%3A0x6bff2fc0a3892a0f!2s119%20Belmont%20Ave%2C%20Los%20Angeles%2C%20CA%2090026!5e0!3m2!1sen!2sus!4v1710000000000"
            allowFullScreen
            className="w-full h-64 rounded-xl"
            loading="lazy"
          ></iframe>
        </div>
      </section>

      {/* Join Section */}
      <section className="bg-prime  px-4 py-6 m-6 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-semibold mb-2">Join Our Journey</h2>
        <p className="mb-4">
          Become a part of our rich history and help shape the future of
          Lordland University. Discover programs, events, and opportunities that
          await you.
        </p>
    <Link to={"/academic"} className="btn btn-primary px-8">
          Apply Now
        </Link>
      </section>
    </div>
  );
};

export default AboutPage;
