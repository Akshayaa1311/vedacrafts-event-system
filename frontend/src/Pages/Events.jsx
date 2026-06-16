import AdminSidebar from "../Components/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/events?t=${Date.now()}`
      );

      const today = new Date();

      const updatedEvents = res.data.map((ev) => {
        const newEvent = [...ev];
        const status = (newEvent[15] || "").trim().toLowerCase();
        const deadline = new Date(newEvent[10]);

        if (status === "published" && deadline < today) {
          newEvent[15] = "closed";
          axios
            .put(`http://localhost:5000/events/${newEvent[0]}/status`, {
              status: "closed",
            })
            .catch((err) => console.log("Auto-close failed:", err));
        } else {
          newEvent[15] = status;
        }

        return newEvent;
      });

      setEvents(updatedEvents);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (ev) => (ev[15] || "").trim().toLowerCase();

  const publishedCount = events.filter((e) => normalizeStatus(e) === "published").length;
  const draftCount     = events.filter((e) => normalizeStatus(e) === "draft").length;
  const closedCount    = events.filter((e) => normalizeStatus(e) === "closed").length;

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((e) => normalizeStatus(e) === filter);

  const handlePublish = async (eventId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/events/${eventId}/status`,
        { status: "published" }
      );
      await fetchEvents();
    } catch (err) {
      console.log(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (eventId) => {
    try {
      await axios.put(
        `http://localhost:5000/events/${eventId}/status`,
        { status: "closed" }
      );
      await fetchEvents();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-[#f8f5ef] min-h-screen">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#245c1f]">Events Management</h1>
            <p className="text-gray-600 mt-1">Manage all your events in one place.</p>
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="w-full sm:w-auto bg-[#245c1f] text-white px-5 py-3 rounded-xl hover:scale-105 transition"
          >
            + Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8 md:mb-10">
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-xs md:text-sm">Published</p>
            <h2 className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{publishedCount}</h2>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-xs md:text-sm">Drafts</p>
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-500 mt-2">{draftCount}</h2>
          </div>
          <div className="bg-white p-4 md:p-5 rounded-2xl shadow">
            <p className="text-gray-500 text-xs md:text-sm">Closed</p>
            <h2 className="text-2xl md:text-3xl font-bold text-red-500 mt-2">{closedCount}</h2>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 md:px-5 py-2 rounded-xl text-sm font-medium ${
              filter === "all" ? "bg-[#245c1f] text-white" : "bg-white shadow"
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-3 md:px-5 py-2 rounded-xl text-sm font-medium ${
              filter === "published" ? "bg-green-600 text-white" : "bg-white shadow"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-3 md:px-5 py-2 rounded-xl text-sm font-medium ${
              filter === "draft" ? "bg-yellow-500 text-white" : "bg-white shadow"
            }`}
          >
            Draft ({draftCount})
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`px-3 md:px-5 py-2 rounded-xl text-sm font-medium ${
              filter === "closed" ? "bg-red-500 text-white" : "bg-white shadow"
            }`}
          >
            Closed ({closedCount})
          </button>
        </div>

        {/* Event Cards */}
        <div className="space-y-5">
          {filteredEvents.length === 0 && (
            <p className="text-gray-500 text-center py-10">
              No {filter === "all" ? "" : filter} events found.
            </p>
          )}

          {filteredEvents.map((event) => (
            <div
              key={event[0]}
              className="bg-[#eef5ea] rounded-[24px] md:rounded-[30px] p-5 md:p-8 border border-[#dce8d5]"
            >
              {/* Top section: image + info */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {event[16] && (
                  <img
                    src={event[16]}
                    alt={event[1]}
                    className="w-full sm:w-28 h-48 sm:h-28 object-cover rounded-2xl shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg md:text-xl font-bold text-[#245c1f] leading-snug">
                    {event[1]}
                  </h2>
                  <p className="text-gray-600 mt-2 text-sm">{event[9]} • {event[4]}</p>
                  <span
                    className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${
                      normalizeStatus(event) === "published"
                        ? "bg-green-100 text-green-700"
                        : normalizeStatus(event) === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {normalizeStatus(event)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => navigate(`/edit-event/${event[0]}`)}
                  className="flex-1 sm:flex-none bg-[#ffbe2a] px-4 py-2 rounded-xl font-medium text-sm text-center"
                >
                  Edit
                </button>

                {normalizeStatus(event) === "draft" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePublish(event[0])}
                    className="flex-1 sm:flex-none bg-green-600 text-white px-4 py-2 rounded-xl text-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Publishing..." : "Publish"}
                  </button>
                )}

                {normalizeStatus(event) === "published" && (
                  <button
                    onClick={() => handleClose(event[0])}
                    className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Events;