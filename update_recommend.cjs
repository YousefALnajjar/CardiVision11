const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetRecommend = `      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });`;

const replacementRecommend = `      const systemInstruction = "مساعد طبي وهندسي خبير خاص بمنصة CardioVision. مهمتك تقديم إجابات دقيقة وموثوقة بناءً على البيانات المقدمة. يمنع الإجابة على أي أسئلة خارج نطاق المنصة";
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: systemInstruction,
          temperature: 0.1,
          maxOutputTokens: 800
        }
      });`;

content = content.replace(targetRecommend, replacementRecommend);
fs.writeFileSync('server.ts', content);
