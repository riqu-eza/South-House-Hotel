/* eslint-disable no-unused-vars */
// src/components/Home.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Amenity from "../utility/amenity";
import BookingForm from "../utility/BookingForm";
import Footer from "../components/footer";
import Viewall from "../utility/images_commect";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SwiperCore from "swiper";
import { Navigation, Pagination } from "swiper/modules";
SwiperCore.use([Navigation, Pagination]);

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sites, setSites] = useState([]);
  const toggleModal = () => setShowModal(!showModal);
  const [showModal, setShowModal] = useState(false);

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  const propertyDescriptionRef = useRef(null);
  const bookingFormRef = useRef(null);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/listing/getlisting");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log(result);
        setData(result);
        setSelectedProperty(result[0] || null);
        console.log("result", result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const response = await fetch("/api/site/getall");
        if (!response.ok) {
          throw new Error("Failed to fetch sites.");
        }
        const data = await response.json();
        setSites(data);
      } catch (err) {
        setError(err.message || "An error occurred.");
      }
    };

    loadSites();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setBookingData((prevData) => ({
      ...prevData,
      [id]: value, // Dynamically update the field based on input ID
    }));
  };

  const checkAvailability = async () => {
    try {
      const response = await fetch("/api/booking/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to check availability. Please try again.");
      }

      const result = await response.json();

      // Update availability based on result
      if (result.available === true) {
        setAvailability(true);
        bookingFormRef.current.scrollIntoView({ behavior: "smooth" });
      } else if (result.available === false) {
        setAvailability(false);
        setMessage("The selected dates are not available.");
        setTimeout(() => {
          setMessage("");
          setBookingData((prev) => ({
            ...prev,
            checkIn: "",
            checkOut: "",
            guests: 1,
          })); // Reset bookingData to initial state
        }, 10000);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setMessage("An error occurred while checking availability.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  // eslint-disable-next-line no-unused-vars
  const property = data.length > 0 ? data[0] : null;

  // Safely access amenities and rules, defaulting to an empty array if `property` is `null`
  const amenitiesArray =
    selectedProperty?.amenities?.[0]
      ?.split(",")
      .map((amenity) => amenity.trim()) || [];
  // const rules = property?.rules
  //   ? property.rules.split(",").map((rule) => rule.trim())
  //   : [];
  const mapIframe = selectedProperty?.location?.mapurl?.[0] || "";
  const { imageUrls = [], name, _id } = selectedProperty || {};
  const srcUrl = mapIframe.match(/src="([^"]*)"/)?.[1] || "";

  return (
    <>
      {/* Navigation Bar */}
      <nav className="flex justify-center gap-4 p-4 bg-gray-200">
        {data.map((property, index) => (
          <button
            key={index}
            onClick={() => setSelectedProperty(property)} // Update selectedProperty on click
            className={`px-4 py-2 rounded-lg ${
              selectedProperty?._id === property._id
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700"
            } hover:bg-blue-400 transition-colors duration-200`}
          >
            {property.type || `Property ${index + 1}`}
          </button>
        ))}
      </nav>

      {selectedProperty ? (
        <>
          {/* Header Section */}
          <div className="flex flex-wrap items-center w-full gap-2 p-2">
            {/* Left Section */}
            <div className="flex-1 min-w-[200px] p-2">
              {selectedProperty ? (
                <h2 className="text-center text-xl sm:text-2xl font-bold font-[Poppins] ">
                  {selectedProperty.name}
                </h2>
              ) : (
                <p className="text-center text-sm font-[Montserrat] sm:text-base">
                  No property data available.
                </p>
              )}
            </div>

            {/* Right Section */}
            <div className="flex-1 min-w-[200px] p-2 flex font-[Montserrat] justify-center md:justify-end">
              <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
                <Link to="/" className="text-sm sm:text-base hover:underline">
                  Home
                </Link>
                <button
                  onClick={() =>
                    propertyDescriptionRef.current.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="text-sm sm:text-base hover:underline"
                >
                  About
                </button>
                <button
                  onClick={() =>
                    bookingFormRef.current.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  className="text-sm sm:text-base hover:underline"
                >
                  Book Now
                </button>
              </nav>
            </div>
          </div>

          {/* Hero Image Section */}
          <div className="relative w-full h-[400px] sm:h-[300px] md:h-[400px] lg:h-[600px] xl:h-[700px]">
            {selectedProperty && selectedProperty.imageUrls?.length > 0 && (
              <img
                src={selectedProperty.imageUrls[0]}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
              />
            )}
            {/* Overlay with Main Header and Subheader */}
            <div className="absolute inset-0 bg-black bg-opacity-0 flex flex-col gap-6 items-center justify-center p-4">
              <h1 className="text-white font-[Poppins] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center animate-slide-in">
                {sites[0]?.mainheader || "Welcome to Our Property"}
              </h1>
              <p className="text-center font-[Montserrat] text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
                {sites[0]?.subheader ||
                  "Experience unparalleled comfort and serenity in our exquisite property, where every detail is crafted for your ultimate relaxation."}
              </p>
            </div>
          </div>

          {/* Booking Form Overlay */}
          <div className="flex flex-col md:flex-row h-[80vh] w-full">
            <div className="w-full md:w-[60%] h-full border-r border-gray-300 flex items-center justify-center p-2">
              <iframe
                src={srcUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-lg"
              ></iframe>
            </div>
            <div className="w-full md:w-[40%] h-full p-4 flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {name}
              </h2>

              {/* Swiper for Image Carousel */}
              <Swiper
                modules={[Pagination, Navigation]}
                spaceBetween={10}
                slidesPerView={1}
                pagination={{ clickable: true, dynamicBullets: true }}
                navigation
                className="w-full flex-grow rounded-md shadow-md"
              >
                {imageUrls.length > 0 ? (
                  imageUrls.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-[300px] md:h-[350px] object-cover rounded-md"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <div className="w-full h-[300px] md:h-[350px] flex items-center justify-center bg-gray-200 rounded-md">
                    <p className="text-gray-500">No Images Available</p>
                  </div>
                )}
              </Swiper>

              {/* Show All Images Button */}
              <button
                className="mt-4 bg-blue-600 text-white py-2 px-4 font-semibold rounded-md shadow-md hover:bg-blue-700 transition"
                onClick={toggleModal}
              >
                View All Images
              </button>
            </div>
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                <div className="relative w-full h-full md:w-3/4 md:h-3/4 bg-white rounded-lg overflow-hidden">
                  {/* Close Button */}
                  <button
                    onClick={toggleModal}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full z-10 hover:bg-red-600 transition duration-200"
                  >
                    ✕
                  </button>
                  <Swiper
                    navigation
                    pagination={{ clickable: true }}
                    className="h-full"
                  >
                    {imageUrls.map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={image}
                          alt={`Full View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
          </div>
          {/* Property Description */}

          {/* Property Amenities and Rules */}
          <div className="p-6 mt-12 flex flex-col lg:flex-row gap-6 bg-white rounded-lg shadow-md border border-gray-200">
            {selectedProperty ? (
              <div className="w-full">
                {/* Amenities & Additional Info Section */}
                <div className="w-full h-auto p-4 flex flex-col gap-6 text-gray-700">
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Amenities */}
                    <div className="w-full md:w-1/2">
                      <h3 className="text-center font-bold text-lg text-gray-800 border-b-2 border-blue-500 pb-2">
                        Amenities Available
                      </h3>
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {amenitiesArray.length > 0 ? (
                          amenitiesArray.map((amenity, index) => (
                            <Amenity key={index} amenity={amenity} />
                          ))
                        ) : (
                          <p className="text-center text-gray-500">
                            No amenities listed
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Check-in & Check-out Info */}
                    <div className="w-full md:w-1/2 text-gray-600 text-sm lg:text-base leading-relaxed">
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm border-l-4 border-blue-500 flex flex-col items-center text-center">
                        <p className="text-gray-900 font-semibold text-lg">
                          🏡 Open 24/7
                        </p>
                        <p className="mt-1 text-gray-600">
                          We welcome guests at{" "}
                          <span className="text-blue-600 font-semibold">
                            any time of the day
                          </span>
                          . Whether early morning or late at night, our doors
                          are always open for you.
                        </p>
                        <div className="mt-3 text-gray-700 text-sm">
                          ✅ <span className="font-semibold">Check-in:</span>{" "}
                          Anytime 🔔{" "}
                          <span className="font-semibold">Check-out:</span>{" "}
                          Anytime
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 w-full">
                No property data available.
              </p>
            )}
          </div>

          {/* Booking Section */}
          <div ref={bookingFormRef}>
            <BookingForm
              price={selectedProperty.pricePerNight}
              type={selectedProperty.type}
              initialData={{
                checkInDate: bookingData.checkIn,
                checkOutDate: bookingData.checkOut,
                guestNumber: bookingData.guests,
              }}
              manageremail={selectedProperty.email}
            />
          </div>

          {/* View All Section */}
          <div>
            <Viewall property={selectedProperty} />
          </div>

          {/* Footer */}
          <Footer data={selectedProperty} />
        </>
      ) : (
        <p className="text-center mt-4 text-gray-500">No property selected.</p>
      )}
    </>
  );
};

export default Home;
