const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetConsultation = `          const prompt = \`You are CardioVision's Senior AI Engineering Consultant. Generate a detailed academic graduation project proposal schematic and workflow for the following concept:
Language: \${language === "en" ? "English" : "Arabic"}
Consultation Type: \${type}
User Concept: \${cleanIdea}

Provide clear sections:
1. Block Diagram & Hardware Layout
2. Microcontroller & Firmware Choice
3. Software, Libraries & Algorithms
4. Step-by-Step Implementation Strategy\`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
          });`;

const replacementConsultation = `          const systemInstruction = "مساعد طبي وهندسي خبير خاص بمنصة CardioVision. مهمتك تقديم إجابات دقيقة وموثوقة بناءً على البيانات المقدمة. يمنع الإجابة على أي أسئلة خارج نطاق المنصة";

          const prompt = \`Context / السياق:
You are generating an academic engineering consultation for CardioVision.
Consultation Type: \${type}

User Concept / فكرة المستخدم:
\${cleanIdea}

Please provide clear engineering sections (Block Diagram, Hardware, Software, Implementation Strategy) in \${language === "en" ? "English" : "Arabic"}.\`;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.1,
              maxOutputTokens: 1000
            }
          });`;

content = content.replace(targetConsultation, replacementConsultation);
fs.writeFileSync('server.ts', content);
