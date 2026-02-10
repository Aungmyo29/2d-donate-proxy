const timeWindows = {
  "12:01": { start: "11:45", end: "12:05", lines: ["modern"] },
  "16:30": { start: "15:45", end: "16:35", lines: ["modern"] },
  "09:30": { start: "09:00", end: "09:45", lines: ["modern", "internet", "tw"] },
  "14:00": { start: "13:30", end: "14:30", lines: ["modern", "internet", "tw"] }
};
module.exports = async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toISOString().slice(11, 16); // HH:mm format ရယူတယ်

    const result = {};

    for (const [timeKey, window] of Object.entries(timeWindows)) {
      const [startH, startM] = window.start.split(':').map(Number);
      const [endH, endM] = window.end.split(':').map(Number);
      const [currH, currM] = currentTime.split(':').map(Number);

      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      const currMin = currH * 60 + currM;

      // အချိန်ဝင်းဒိုး ထဲ ရှိမရှိ စစ်တယ်
      if (currMin >= startMin && currMin <= endMin) {
        result[timeKey] = {};

        for (const line of window.lines) {
          let value = "--"; // မရရင် ဒီလို ပြမယ်

          if (line === "modern") {
            // Modern line (Thai SET) ကနေ ယူတယ်
            const response = await fetch('https://api.thaistock2d.com/live');
            if (response.ok) {
              const data = await response.json();
              // ဒီနေရာမှာ 2D တန်ဖိုး တွက်ပါ
              // မင်း အရင်ကုဒ်မှာ ဘယ်လို တွက်ခဲ့လဲ အတိုင်း ပြင်ထားပါ
              // ဥပမာ အခု အတု ထားထားတယ်
              value = data.live?.twod || "--";
            }
          } else if (line === "internet") {
            // Internet line အတွက် တခြား source ထည့်ပါ (အခု အတု)
            value = "43"; // တကယ် API ရှိရင် အဲ့ URL ကို ထည့်ပါ
          } else if (line === "tw") {
            // TW line အတွက် (အခု အတု)
            value = "75"; // တကယ် Taiwan index API ရှိရင် ထည့်ပါ
          }

          result[timeKey][line] = value;
        }
      }
    }

    // ရလဒ်ကို ပြန်ပေးတယ်
    res.status(200).json({
      times: result,
      server_time: now.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
};
