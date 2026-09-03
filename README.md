<div align="center">

# 🎬 Discord Video Player

بث وسائط وصوتيات عالية الدقة في قنوات ديسكورد الصوتية عبر WebRTC & FFmpeg

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)
![Discord](https://img.shields.io/badge/Discord-Selfbot-5865F2?style=for-the-badge&logo=discord)
![FFmpeg](https://img.shields.io/badge/FFmpeg-Enabled-007808?style=for-the-badge&logo=ffmpeg)

</div>

---

### ✨ المميزات
- 🎥 **نمطان للبث:** بث شاشة (**Go-Live**) أو بث كاميرا (**Camera**) بصوت مباشر بالروم.
- 🔊 **جودة صوت عالية:** ترميز Opus بمعدل 48kHz بدون تقطيع.
- ⚡ **تخطي الحظر تلقائياً:** دعم محاكاة Android لتجاوز فحص الروبوت (HTTP 429) من يوتيوب.
- 🌐 **ثنائي اللغة:** يدعم كتابة الأوامر بالعربية والإنجليزية.

---

### ⚙️ الإعداد السريع

1. أنشئ ملف `.env`:
```env
DISCORD_TOKEN=التوكن_هنا
PREFIX=!
ALLOWED_IDS=ايدي_حسابك
STREAM_TYPE=go-live
```

2. التثبيت والتشغيل:
```bash
npm install
npm start
```

---

### 🎮 الأوامر

| الأمر | البديل العربي | الوظيفة |
| :--- | :--- | :--- |
| `!cam <رابط>` | `!كام` | بث كاميرا (الصوت يخرج للجميع مباشرة في الروم) |
| `!play <رابط>` | `!شغل` | بث شاشة (Go-Live) |
| `!stop` | `!وقف` | إيقاف البث |
| `!leave` | `!اخرج` | مغادرة الروم |

---

### 🔗 المصادر المدعومة
- 🔴 روابط YouTube المباشرة
- 🌐 روابط الفيديو الرقمية المباشرة (`mp4`, `mkv`, `webm`, `m3u8`)
- 📁 ملفات الفيديو المخزنة محلياً على الجهاز أو السيرفر
