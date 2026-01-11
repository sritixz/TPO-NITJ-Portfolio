import { useEffect, useState } from "react";
import axios from "axios";

const TpoMessage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.REACT_APP_BASE_URL}/messages`)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => {
        console.error("Error fetching messages:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p className="text-center text-gray-500">
        Loading messages...
      </p>
    );
  }

  if (!messages.length) {
    return (
      <p className="text-center text-gray-500">
        Messages will be updated soon.
      </p>
    );
  }

  return (
    <>
      <h1 className="text-5xl font-bold text-center mb-10">
        Head&apos;s<span className="text-custom-blue"> Message</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-5">
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col items-center justify-center">
            {/* Avatar */}
            <div
              className="-mb-20 z-10 rounded-full w-36 h-36 border-2 border-[#A5C8FFB2] bg-gray-200"
              style={{
                backgroundImage: `url(${import.meta.env.REACT_APP_BASE_URL}${msg.author?.image || "/default-avatar.png"})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Card */}
            <div
              className="w-full p-5 rounded-lg border border-[#A5C8FFB2]"
              style={{
                background: "url('Background card.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            >
              <div
                className="relative rounded-lg p-5"
                style={{
                  background:
                    "linear-gradient(180deg, #FFFFFF 0%, #DEE9F9 50.48%, #9DBCE4 100%)",
                }}
              >
               <div className="mt-16 text-md font-poppins relative">
  <div className="flex items-start gap-4">
    
    <img
      src="inverted Comma.png"
      alt=""
      className="w-6 h-6 mt-1"
    />

    <p className="text-justify leading-relaxed">
      {msg.content}
    </p>

  </div>
  <br/>
  <br/>

                  <span className=" font-semibold">
                    {msg.author?.name}
                    <br />
                    {msg.author?.designation || msg.author?.role}
                    <br />
                    {msg.author?.email }
                    <br />
                    {msg.author?.mobile }
                    <br />
                    NIT Jalandhar
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TpoMessage;
