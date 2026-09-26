const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetQA = `          const prompt = \`You are CardioVision's Senior Embedded Systems & AI Technical Assistant.
Answer the following student engineering question concisely, accurately, and practically about this graduation project.
Respond in \${lang === "en" ? "English" : "Arabic"}.

Context:
\${projectContext}

Student Question:
\${cleanQuestion}

Provide clear, precise engineering advice (e.g., pin connections, wiring logic, libraries, algorithms, or debugging steps).\`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
          });`;

const replacementQA = `          const systemInstruction = "مساعد طبي وهندسي خبير خاص بمنصة CardioVision. مهمتك تقديم إجابات دقيقة وموثوقة بناءً على البيانات المقدمة. يمنع الإجابة على أي أسئلة خارج نطاق المنصة";

          const prompt = \`Context / السياق:
\${projectContext || 'معلومات المنصة العامة'}

Student Question / السؤال:
\${cleanQuestion}

Please respond concisely and accurately in \${lang === "en" ? "English" : "Arabic"}.\`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.1,
              maxOutputTokens: 800
            }
          });`;

content = content.replace(targetQA, replacementQA);
fs.writeFileSync('server.ts', content);
