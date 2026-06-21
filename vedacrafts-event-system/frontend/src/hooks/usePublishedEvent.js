import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";

export function usePublishedEvent() {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`${API_URL}/events/published`);
        const row = res.data;
        setEvent({
          eventId:       row[0],
          titleEn:       row[1],
          titleTa:       row[2],
          type:          row[3],
          date:          row[4],
          time:          row[5],
          venueEn:       row[6],
          venueTa:       row[7],
          seats:         row[8],
          district:      row[9],
          deadline:      row[10],
          descriptionEn: row[11],
          descriptionTa: row[12],
          speakersEn:    JSON.parse(row[13] || "[]"),
          speakersTa:    JSON.parse(row[14] || "[]"),
          status:        row[15],
          banner:        row[16],
        });
      } catch (err) {
        console.log("No published event:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, []);

  return { event, loading };
}