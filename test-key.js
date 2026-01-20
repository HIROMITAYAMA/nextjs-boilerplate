const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = "AIzaSyDHQvOGY0_FtKteXE1RWMvA6M7LYwrbgTI";
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
        const result = await model.generateContent("Hello");
        console.log(`Success with ${modelName}:`, result.response.text());
    } catch (e) {
        console.error(`Error with ${modelName}:`, e.message);
        if (e.response) {
            console.error(`Response for ${modelName}:`, JSON.stringify(e.response, null, 2));
        }
        // Also try to log specific error details if available in the error object
        console.error('Full Error Object:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
    }
}

async function run() {
    await testModel('gemini-1.5-flash');
    await testModel('gemini-pro');
}

run();
