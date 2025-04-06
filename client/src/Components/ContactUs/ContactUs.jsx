import Lottie from "lottie-react";
import React from "react";
import contactAnimation from "../../../public/contactAnimation.json"

const ContactUs = () => {
  return (
    <div>
      <h3 className="text-highlight text-3xl md:text-4 lg:text-5xl font-black text-center">
        Contact Us
      </h3>
      <p className="text-sm font-medium w-11/12 md:w-2/3 mx-auto text-center mt-3">
      We're here to help! Reach out to us anytime with your questions, feedback, or inquiries. Our dedicated support team is ready to assist you and will respond as quickly as possible.
      </p>
      <div className="flex flex-col md:flex-row items-center justify-between gap-5 my-12 ">
        <div className="w-full md:w-1/2">
        <Lottie 
         style={{ height: "300px", width: "100%" }}
      animationData={contactAnimation} loop={true} />
        </div>
        {/* form-container */}
        <div className="w-full md:w-1/2  rounded-3xl shadow-md">
          <div className="card-body">
            <fieldset className="fieldset">
                {/* email */}
              <div className="mt-3">
              <label className="fieldset-label">Name</label>
              <input type="text" className="input w-full" placeholder="Name" />
              </div>
              {/* number */}
              <div className="mt-3">
                
              <label className="fieldset-label">Phone No</label>
              <input type="number" className="input w-full" placeholder="Password" />
              </div >
              {/* Message */}
              <div className="mt-3">

              <label className="fieldset-label">Message</label>
              <textarea className="textarea h-24 w-full" placeholder="Message"></textarea>
              </div>
              <div>
              </div>
              <button className="btn btn-neutral mt-4">Send</button>
            </fieldset>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
