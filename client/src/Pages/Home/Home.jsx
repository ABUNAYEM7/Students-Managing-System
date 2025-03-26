import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay"; // Ensure Autoplay styles are imported
import { Pagination, Autoplay } from "swiper/modules"; // Import Autoplay module
import image1 from "../../assets/bannerImage1.jpg";
import image2 from "../../assets/bannerImage2.jpg";
import image3 from "../../assets/bannerImage3.jpg";
import KeyFeatures from "../../Components/Features/KeyFeatures";
import SimpleSteps from "../../Components/SimpleSteps/SimpleSteps";
import ContactUs from "../../Components/ContactUs/ContactUs";
import SmartCampus from "../../Components/SmartCampus/SmartCampus";
import University from "../../Components/Universilty/University";
import OurGallery from "../../Components/OurGallery/OurGallery";
import OurCourses from "../../Components/OurCourses/OurCourses";

const Home = () => {
  const slides = [
    {
      image: image1,
      heading: "Welcome to Student Management",
      description:
        "Manage student records effortlessly with our innovative platform, offering seamless enrollment, attendance, and performance tracking in a secure and user-friendly system.",
    },
    {
      image: image2,
      heading: "Track Academic Performance",
      description:
        "Easily monitor grades, attendance, and progress in real-time with our secure, user-friendly system, ensuring accurate tracking, seamless management, and improved student performance.",
    },
    {
      image: image3,
      heading: "Efficient Communication",
      description:
        "Keep students, teachers, and parents connected effortlessly with our seamless communication platform, ensuring collaboration, real-time updates, and improved academic engagement.",
    },
  ];

  return (
    <div>
      {/* banner */}
      <div className="relative h-[600px]">
        <Swiper
          pagination={{ clickable: true }}
          modules={[Pagination, Autoplay]} // Add Autoplay module
          autoplay={{ delay: 3000, disableOnInteraction: false }} // Configure autoplay
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="relative">
              <img
                className="h-full w-full object-cover object-center"
                src={slide.image}
                alt={`Slide ${index + 1}`}
              />

              <div className="absolute inset-0 bg-black/40 bg-opacity-10"></div>

              <div className="absolute inset-y-0 left-10 flex flex-col justify-center">
                <h1 className="text-white text-4xl font-bold drop-shadow-lg">
                  {slide.heading}
                </h1>
                <p className="text-white mt-4 drop-shadow-md lg:2/3 md:max-w-1/2 max-w-2/3">
                  {slide.description}
                </p>

                <div className="flex items-center gap-5">
                  <button className="btn w-fit mt-4 text-white bg-orange-600 border-none hover:bg-white hover:border-2 hover:text-orange-600">
                    Enroll Now
                  </button>
                  <button className="btn w-fit mt-4 text-white  border-2 border-orange-600 bg-transparent">
                    Learn More
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* university-section */}
      <section>
        <University />
      </section>
      {/* smartCamp-section */}
      <section>
        <SmartCampus />
      </section>
      {/* OurGallery-section */}
      <section className="my-12 p-4">
        <OurGallery />
      </section>
      {/* OurCourses section */}
      <section className="my-12 p-4">
        <OurCourses />
      </section>
      {/* features-section */}
      <section className="my-12 p-4">
        <KeyFeatures />
      </section>
      {/* SimpleSteps-section */}
      <section className="my-12 p-4">
        <SimpleSteps />
      </section>
      {/* contact us-section */}
      <section className="my-12 p-4">
        <ContactUs />
      </section>
    </div>
  );
};

export default Home;
