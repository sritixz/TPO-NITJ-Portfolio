import React, { useEffect, useRef, useState } from "react";


const CardSkeleton = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-2 p-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    ))}
  </div>
);

const RecentNotification = ({ loading, notifications }) => {
    const listRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [startScroll, setStartScroll] = useState(false);

    // Initial pause before starting scroll
    useEffect(() => {
      if (!loading) {
        const timer = setTimeout(() => {
          setStartScroll(true);
        }, 1000); // 2 second initial pause

        return () => clearTimeout(timer);
      }
    }, [loading]);

    // Scrolling effect with hover pause
    useEffect(() => {
      if (!loading && startScroll && !isHovered) {
        const interval = setInterval(() => {
          if (listRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = listRef.current;

            if (scrollTop + clientHeight >= scrollHeight) {
              // Reset to top after reaching bottom
              setTimeout(() => {
                if (listRef.current) {
                  listRef.current.scrollTop = 0;
                }
              }, 20);
            } else {
              listRef.current.scrollTop += 1;
            }
          }
        }, 50);

        return () => clearInterval(interval);
      }
    }, [loading, startScroll, isHovered]);

    const items = notifications;

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-xl h-[320px] w-full max-w-3xl">
        <div className="px-4 py-3 bg-custom-blue text-white">
          <h2 className="text-lg font-medium">Job Notifications</h2>
        </div>

        <div
          ref={listRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`h-[calc(100%-48px)] ${
            items.length > 2
              ? "scrollbar-thin scrollbar-thumb-custom-blue scrollbar-track-transparent hover:scrollbar-track-gray-100"
              : ""
          } overflow-y-auto [&::-webkit-scrollbar]{width:4px} [&::-webkit-scrollbar-thumb]{min-height:40px}`}
        >
          <div className="space-y-0.5">
            {loading ? (
              <CardSkeleton />
            ) : (
              <div className="space-y-2 px-1 py-1">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const notificationDate = new Date(notification.timestamp);
                    const today = new Date();
                    const isToday =
                      notificationDate.getDate() === today.getDate() &&
                      notificationDate.getMonth() === today.getMonth() &&
                      notificationDate.getFullYear() === today.getFullYear();

                    return (
                      <div
                        key={notification._id}
                        className="px-4 py-3 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200 border-l-3 border hover:border-custom-blue relative"
                      >
                        <div className="flex items-center">
                          <p className="text-sm text-gray-800 flex-grow">
                            {notification.message}
                          </p>
                          {isToday && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="min-h-[250px] flex items-center justify-center">
                    <div className="p-6 bg-white rounded-lg text-center w-full max-w-md mx-auto">
                      {/* Icon */}
                      <div className="flex justify-center mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-custom-blue animate-bounce"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </div>
                      {/* Message */}
                      <p className="text-sm text-gray-800 font-medium">
                        No notifications available.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        You're all caught up!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default RecentNotification;