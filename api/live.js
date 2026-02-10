const timeWindows = {
  "12:01": { start: "00:00", end: "23:59", lines: ["modern"] },
  "16:30": { start: "00:00", end: "23:59", lines: ["modern"] },
  "09:30": { start: "00:00", end: "23:59", lines: ["modern", "internet"] },
  "14:00": { start: "00:00", end: "23:59", lines: ["modern", "internet"] }
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
                // ဒီနေရာမှာ တကယ့် 2D တန်ဖိုး ယူတယ်
                // မင်း စမ်းတဲ့အခါ "41" ထွက်ခဲ့တာ အဆင်ပြေရင် ဒီအတိုင်း ဆက်ထားမယ်
                value = data.live?.twod || "--";
              }
            } catch (e) {
              value = "--";
            }
          } 
          else if (line === "internet") {
            try {
              // Internet line အတွက် SET ကနေ ယူတယ်
              const response = await fetch('https://api.set.or.th/api/market/quote/internet');
              if (response.ok) {
                const data = await response.json();
                value = data.last || "--";  // နောက်ဆုံး တန်ဖိုး
              }
            } catch (e) {
              value = "--";
            }
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
