const timeWindows = {
  "12:01": { start: "11:45", end: "12:05", lines: ["modern"] },
  "16:30": { start: "15:45", end: "16:35", lines: ["modern"] },
  "09:30": { start: "09:00", end: "09:45", lines: ["modern", "internet", "tw"] },
  "14:00": { start: "13:30", end: "14:30", lines: ["modern", "internet", "tw"] }
};

module.exports = async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toISOString().slice(11, 16); // HH:mm

    const result = {};

    for (const [timeKey, window] of Object.entries(timeWindows)) {
      const [startH, startM] = window.start.split(':').map(Number);
      const [endH, endM] = window.end.split(':').map(Number);
      const [currH, currM] = currentTime.split(':').map(Number);

      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const currMin = currH * 60 + currM;

      if (currMin >= startMin && currMin <= endMin) {
        result[timeKey] = {};

        for (const line of window.lines) {
          let value = "--";

          if (line === "modern") {
            try {
              const response = await fetch('https://api.thaistock2d.com/live');
              if (response.ok) {
                const data = await response.json();
                value = data.live?.twod || "--";
              }
            } catch (e) {
              value = "--";
            }
          } else if (line === "internet") {
            value = "43";
          } else if (line === "tw") {
            value = "75";
          }

          result[timeKey][line] = value;
        }
      }
    }

    res.status(200).json({
      times: result,
      server_time: now.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
