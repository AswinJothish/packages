import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Slider from "react-slick";
import { useQuery } from "@tanstack/react-query";
import _axios from "@/lib/_axios";

const Testimonial: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["Testimonials"],
    queryFn: () => _axios.get(`/testimonial/all`).then((res) => res.data),
    select(data) {
      return data.testimonials || [];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    cssEase: "ease",
    responsive: [
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
    ],
  };

  return (
    <div className="testimonial-border">
      <div className="md:py-20 flex items-center justify-center">
        <div className="container text-center">
          <h2 className="md:text-4xl text-2xl font-bold md:mb-8 tracking-wider bg-gradient-to-br from-blue-200 via-blue-500 to-blue-800 text-transparent bg-clip-text">
            What Our Clients Say
          </h2>
          <div className="w-full md:max-w-4xl mx-auto">
            <div className="testimonial-slider">
              <Slider {...settings}>
                {data.map((testimonial: any, index: number) => (
                  <div
                    key={testimonial._id || index}
                    className="p-6 ml-4 md:ml-0 md:pb-10 relative overflow-hidden"
                  >
                    <div className="relative z-10 border-[2px] border-blue-300 drop-shadow-xl bg-white rounded-xl p-2">
                      <div className="mb-6">
                        <p className="text-lg text-gray-700">
                          <span className="text-3xl font-bold text-blue-500 pr-5 font-pacifico">"</span>
                          {testimonial.testimonial}
                          <span
                            style={{ display: "inline-block", transform: "scaleX(-1)", paddingRight: "20px" }}
                            className="text-3xl font-bold text-blue-500 pl-5 font-pacifico"
                          >
                            "
                          </span>
                        </p>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold bg-gradient-to-br from-blue-200 via-blue-500 to-blue-800 text-transparent bg-clip-text">
                          {testimonial.Clientname}
                        </h3>
                        <p className="text-sm text-blue-800">{testimonial.profession}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
