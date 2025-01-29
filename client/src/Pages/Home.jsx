// src/components/Home.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Amenity from "../utility/amenity";
import BookingForm from "../utility/BookingForm";
import Footer from "../components/footer";
import Viewall from "../utility/images_commect";


const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [sites, setSites] = useState([]);

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
          setBookingData((prev) => ({ ...prev, checkIn: "", checkOut: "", guests: 1 })); // Reset bookingData to initial state
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
    selectedProperty?.amenities?.[0]?.split(",").map((amenity) => amenity.trim()) || [];
  // const rules = property?.rules
  //   ? property.rules.split(",").map((rule) => rule.trim())
  //   : [];
  const mapIframe = selectedProperty?.location?.mapurl?.[0] || "";

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
          <div className="relative flex justify-center -mt-16 px-4 sm:px-0">
            <div className="w-full max-w-3xl bg-white bg-opacity-90 p-4 rounded-lg shadow-lg flex flex-col sm:flex-row sm:flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4 border border-gray-300">
              {/* Check-in Input */}
              <div className="flex flex-col w-full sm:w-1/3">
                <label htmlFor="checkIn" className="text-sm text-gray-700">
                  Check-in
                </label>
                <input
                  type="date"
                  id="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleChange}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Check-out Input */}
              <div className="flex flex-col w-full sm:w-1/3">
                <label htmlFor="checkOut" className="text-sm text-gray-700">
                  Check-out
                </label>
                <input
                  type="date"
                  id="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleChange}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Guests Input */}
              <div className="flex flex-col w-full sm:w-1/3">
                <label htmlFor="guests" className="text-sm text-gray-700">
                  Guests
                </label>
                <input
                  type="number"
                  id="guests"
                  value={bookingData.guests}
                  min="1"
                  onChange={handleChange}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Check Now Button */}
              <div className="w-full flex justify-center sm:justify-start">
                <button
                  onClick={checkAvailability}
                  className="w-full sm:w-auto p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-200"
                >
                  Check Now
                </button>
              </div>

              {/* Message Display */}
              {message && (
                <p className="w-full mt-4 text-center text-gray-700 sm:text-left">
                  {message}
                </p>
              )}
            </div>

            {/* Availability Message */}
            {availability !== null && (
              <div className="w-full mt-4 text-center">
                {availability ? (
                  <p className="text-green-500">Rooms are available!</p>
                ) : (
                  <p className="text-red-500">
                    No rooms available for the selected dates.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Property Description */}
          <div
            ref={propertyDescriptionRef}
            className="p-2 m-1 mt-12 flex flex-col lg:flex-row gap-4"
          >
            {selectedProperty ? (
              <>
                {/* Description Section */}
                <div className="w-full lg:w-1/2 h-auto lg:h-[450px] p-4 text-center text-stone-500 flex flex-col justify-center items-center">
                  <p className="first-letter:font-thin font-[Montserrat] first-letter:text-7xl">
                    {selectedProperty.description}
                  </p>
                </div>

                {/* Image Section with Fixed Size */}
                <div className="w-full lg:w-1/2 flex justify-center items-center">
                  <div className="w-full max-w-[400px] h-[300px] lg:h-[450px] overflow-hidden p-2">
                    <img
                      src={selectedProperty.imageUrls[1]}
                      alt={selectedProperty.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-stone-500">
                No property data available.
              </p>
            )}
          </div>

          {/* Property Amenities and Rules */}
          <div className="p-1 m-1 mt-12 flex flex-col lg:flex-row gap-4">
            {selectedProperty ? (
              <>
                {/* Image Section */}
                <div className="w-full lg:w-1/2 p-1 flex justify-center lg:justify-end items-center">
                  <div className="w-full max-w-[400px] h-[300px] lg:h-[450px] overflow-hidden p-1">
                    <img
                      src={selectedProperty.imageUrls[3]}
                      alt={selectedProperty.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                </div>

                {/* Amenities and Additional Info Section */}
                <div className="w-full lg:w-1/2 h-auto lg:h-[450px] p-1 flex flex-col gap-4 text-stone-500">
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row gap-4 h-auto lg:h-1/2 p-2">
                    {/* Amenities */}
                    <div className="w-full md:w-1/2">
                      <p className="text-center font-[Poppins] font-bold">
                        Amenities You Will Find
                      </p>
                      <div className="flex flex-wrap font-[Montserrat] justify-center mt-2">
                        {amenitiesArray.map((amenity, index) => (
                          <Amenity key={index} amenity={amenity} />
                        ))}
                      </div>
                    </div>

                    {/* Check-in and Check-out Info */}
                    <div className="w-full md:w-1/2">
                      <p className="text-left text-sm font-[Montserrat] lg:text-base">
                        ✔️ We always welcome our visitors at{" "}
                        <span className="font-semibold">
                          {selectedProperty.checkInTime}
                        </span>{" "}
                        and say a warm goodbye at{" "}
                        <span className="font-semibold">
                          {selectedProperty.checkOutTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Additional Content */}
                  <div className="border-t p-2 flex items-center justify-center h-1/2">
                    <iframe
                      src={srcUrl}
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
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
