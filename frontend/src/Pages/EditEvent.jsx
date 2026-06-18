import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminSidebar from "../Components/AdminSidebar";

import { API_URL } from "../config";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [event, setEvent] = useState({
    titleEn: "",
    titleTa: "",
    type: "",
    date: "",
    time: "",
    venueEn: "",
    venueTa: "",
    seats: "",
    district: "",
    deadline: "",
    descriptionEn: "",
    descriptionTa: "",
    banner: null,
    speakers: [
      {
        nameEn: "",
        nameTa: "",
        designationEn: "",
        designationTa: "",
        company: "",
        experience: "",
        bioEn: "",
        bioTa: "",
        image: null,
      },
    ],
    glimpses: [],
  });

  const addSpeaker = () => {
    setEvent((prev) => ({
      ...prev,
      speakers: [
        ...prev.speakers,
        {
          nameEn: "",
          nameTa: "",
          designationEn: "",
          designationTa: "",
          company: "",
          experience: "",
          bioEn: "",
          bioTa: "",
          image: null,
        },
      ],
    }));
  };

  const removeSpeaker = (index) => {
    const updated = event.speakers.filter((_, i) => i !== index);
    setEvent({ ...event, speakers: updated });
  };

  const handleUpdate = async (status) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("titleEn", event.titleEn);
      formData.append("titleTa", event.titleTa);
      formData.append("type", event.type);
      formData.append("date", event.date);
      formData.append("time", event.time);
      formData.append("venueEn", event.venueEn);
      formData.append("venueTa", event.venueTa);
      formData.append("seats", event.seats);
      formData.append("district", event.district);
      formData.append("deadline", event.deadline);
      formData.append("descriptionEn", event.descriptionEn);
      formData.append("descriptionTa", event.descriptionTa);
      formData.append("status", status);

      if (event.banner) {
        formData.append("banner", event.banner);
      }

      event.speakers.forEach((speaker) => {
        if (speaker.image && typeof speaker.image !== "string") {
          formData.append("speakerImages", speaker.image);
        }
      });

      const speakersEn = event.speakers.map((s) => ({
        nameEn: s.nameEn,
        designationEn: s.designationEn,
        bioEn: s.bioEn,
        company: s.company,
        experience: s.experience,
        image: typeof s.image === "string" ? s.image : "",
      }));

      const speakersTa = event.speakers.map((s) => ({
        nameTa: s.nameTa,
        designationTa: s.designationTa,
        bioTa: s.bioTa,
      }));

      formData.append("speakersdetailsEn", JSON.stringify(speakersEn));
      formData.append("speakersdetailsTa", JSON.stringify(speakersTa));

      await axios.put(
  `${API_URL}/events/${id}/edit`,
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);

      alert("Event Updated Successfully 🚀");
      navigate(`/edit-event/${id}`);
    } catch (err) {
      console.log(err);
      alert("Failed to update event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);

      const selectedEvent = res.data.find(
        (row) => String(row[0]) === String(id)
      );

      if (!selectedEvent) return;

      let speakersData = [];
      try {
        speakersData =
          selectedEvent[13] && typeof selectedEvent[13] === "string"
            ? JSON.parse(selectedEvent[13])
            : [];
      } catch {
        speakersData = [];
      }

      speakersData = speakersData.map((s) => ({
        nameEn: s.nameEn || "",
        nameTa: s.nameTa || "",
        designationEn: s.designationEn || "",
        designationTa: s.designationTa || "",
        company: s.company || "",
        experience: s.experience || "",
        bioEn: s.bioEn || "",
        bioTa: s.bioTa || "",
        image: s.image || null,
      }));

      setEvent({
        titleEn: selectedEvent[1] || "",
        titleTa: selectedEvent[2] || "",
        type: selectedEvent[3] || "",
        date: selectedEvent[4] || "",
        time: selectedEvent[5] || "",
        venueEn: selectedEvent[6] || "",
        venueTa: selectedEvent[7] || "",
        seats: selectedEvent[8] || "",
        district: selectedEvent[9] || "",
        deadline: selectedEvent[10] || "",
        descriptionEn: selectedEvent[11] || "",
        descriptionTa: selectedEvent[12] || "",
        speakers: speakersData.length > 0
          ? speakersData
          : [{
              nameEn: "", nameTa: "",
              designationEn: "", designationTa: "",
              company: "", experience: "",
              bioEn: "", bioTa: "",
              image: null,
            }],
        status: selectedEvent[15] || "draft",
        banner: null,
        glimpses: [],
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f5ef]">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#245c1f]">Edit Event</h1>
          <p className="text-gray-600 mt-1">
            Update and publish events for participants.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-4 md:p-8">
          <div className="grid md:grid-cols-2 gap-6">

            {/* TITLE */}
            <input
              type="text"
              placeholder="Event Title (English)"
              value={event.titleEn}
              onChange={(e) => setEvent({ ...event, titleEn: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />
            <input
              type="text"
              placeholder="Event Title (Tamil)"
              value={event.titleTa}
              onChange={(e) => setEvent({ ...event, titleTa: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* TYPE */}
            <select
              value={event.type}
              onChange={(e) => setEvent({ ...event, type: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select Type</option>
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>

            {/* DATE */}
            <div>
              <label className="font-medium">Event Date *</label>
              <input
                type="date"
                value={event.date}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
            </div>

            {/* TIME */}
            <input
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* VENUE */}
            <input
              type="text"
              placeholder="Venue (English)"
              value={event.venueEn}
              onChange={(e) => setEvent({ ...event, venueEn: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />
            <input
              type="text"
              placeholder="Venue (Tamil)"
              value={event.venueTa}
              onChange={(e) => setEvent({ ...event, venueTa: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* SEATS */}
            <input
              type="number"
              placeholder="Total Seats"
              value={event.seats}
              onChange={(e) => setEvent({ ...event, seats: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            />

            {/* DISTRICT */}
            <select
              value={event.district}
              onChange={(e) => setEvent({ ...event, district: e.target.value })}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="">Select District</option>
              <option>Chennai</option>
              <option>Coimbatore</option>
              <option>Madurai</option>
              <option>Salem</option>
              <option>Trichy</option>
            </select>

            {/* DEADLINE */}
            <div>
              <label className="font-medium">Registration Deadline *</label>
              <input
                type="date"
                value={event.deadline}
                onChange={(e) => setEvent({ ...event, deadline: e.target.value })}
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <textarea
            rows="5"
            placeholder="Description (English)"
            value={event.descriptionEn}
            onChange={(e) => setEvent({ ...event, descriptionEn: e.target.value })}
            className="w-full mt-6 border rounded-xl px-4 py-3"
          />
          <textarea
            rows="5"
            placeholder="Description (Tamil)"
            value={event.descriptionTa}
            onChange={(e) => setEvent({ ...event, descriptionTa: e.target.value })}
            className="w-full mt-6 border rounded-xl px-4 py-3"
          />

          {/* SPEAKERS */}
          <div className="mt-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
              <h2 className="text-xl font-semibold text-[#245c1f]">
                Speaker Details
              </h2>
              <button
                type="button"
                onClick={addSpeaker}
                className="bg-[#ffbe2a] px-4 py-2 rounded-xl font-medium hover:scale-105 transition"
              >
                + Add Another Speaker
              </button>
            </div>

            {event.speakers.map((speaker, index) => (
              <div
                key={index}
                className="border rounded-2xl p-4 md:p-5 mb-6 bg-[#f9f9f9]"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-bold text-[#245c1f]">
                    Speaker {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeSpeaker(index)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Speaker Name (English)"
                  value={speaker.nameEn}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].nameEn = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Speaker Name (Tamil)"
                  value={speaker.nameTa}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].nameTa = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Designation (English)"
                  value={speaker.designationEn}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].designationEn = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Designation (Tamil)"
                  value={speaker.designationTa}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].designationTa = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={speaker.company}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].company = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <input
                  type="number"
                  placeholder="Experience (years)"
                  value={speaker.experience}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].experience = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <textarea
                  placeholder="Speaker Bio (English)"
                  value={speaker.bioEn}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].bioEn = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />
                <textarea
                  placeholder="Speaker Bio (Tamil)"
                  value={speaker.bioTa}
                  onChange={(e) => {
                    const updated = [...event.speakers];
                    updated[index].bioTa = e.target.value;
                    setEvent({ ...event, speakers: updated });
                  }}
                  className="w-full border rounded-xl px-4 py-2 mb-3"
                />

                <div className="mt-3">
                  <label className="font-medium block mb-2">Speaker Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const updated = [...event.speakers];
                      updated[index].image = e.target.files[0];
                      setEvent({ ...event, speakers: updated });
                    }}
                    className="w-full border rounded-xl px-4 py-3 bg-white"
                  />
                  {speaker.image && typeof speaker.image !== "string" && (
                    <img
                      src={URL.createObjectURL(speaker.image)}
                      alt="speaker preview"
                      className="w-24 h-24 rounded-full object-cover mt-4"
                    />
                  )}
                  {speaker.image && typeof speaker.image === "string" && (
                    <img
                      src={speaker.image}
                      alt="speaker"
                      className="w-24 h-24 rounded-full object-cover mt-4"
                    />
                  )}
                </div>
              </div>
            ))}

            {/* EVENT BANNER */}
            <div className="mt-6">
              <label className="font-medium">Event Banner</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEvent({ ...event, banner: e.target.files[0] })
                }
                className="w-full mt-2 border rounded-xl px-4 py-3"
              />
              <p className="text-sm text-gray-500 mt-2">
                Recommended Size: 1920 × 1080 px (16:9)
              </p>
            </div>
          </div>

          {/* GLIMPSES */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Event Glimpses</h2>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setEvent({ ...event, glimpses: Array.from(e.target.files) })
              }
              className="w-full border rounded-xl px-4 py-3 bg-white"
            />
          </div>

          <div className="flex gap-3 flex-wrap mt-4">
            {event.glimpses?.map((img, index) => (
              <img
                key={index}
                src={URL.createObjectURL(img)}
                alt="glimpse preview"
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl"
              />
            ))}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-6">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleUpdate("published")}
              className="w-full sm:w-auto bg-yellow-400 px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Update Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEvent;