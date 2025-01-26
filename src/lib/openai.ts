import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, API calls should be made from a backend server
});

export async function transcribeAudio(audioBlob: Blob): Promise<{
  text: string;
  detectedLanguage: string;
}> {
  try {
    // Create a FormData object with the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('language', 'en'); // Force English output

    const response = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.webm', { type: 'audio/webm' }),
      model: 'whisper-1',
      response_format: 'verbose_json',
      language: 'en'
    });

    return {
      text: response.text,
      detectedLanguage: response.language || 'unknown'
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function generateMedicalReport(transcript: string): Promise<{
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  followUp: string;
  medications: Array<{ name: string; dosage: string; frequency: string }>;
}> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant. Analyze the following medical conversation transcript and generate a structured medical report. Include symptoms, diagnosis, treatment plan, medications, and follow-up recommendations. Be precise and professional.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      functions: [
        {
          name: "generate_medical_report",
          description: "Generate a structured medical report from conversation transcript",
          parameters: {
            type: "object",
            properties: {
              symptoms: {
                type: "array",
                items: { type: "string" },
                description: "List of symptoms mentioned in the conversation"
              },
              diagnosis: {
                type: "string",
                description: "Primary diagnosis based on symptoms and discussion"
              },
              treatment: {
                type: "string",
                description: "Recommended treatment plan"
              },
              followUp: {
                type: "string",
                description: "Follow-up instructions and next steps"
              },
              medications: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    dosage: { type: "string" },
                    frequency: { type: "string" }
                  }
                },
                description: "List of prescribed medications with dosage and frequency"
              }
            },
            required: ["symptoms", "diagnosis", "treatment", "followUp", "medications"]
          }
        }
      ],
      function_call: { name: "generate_medical_report" }
    });

    const result = completion.choices[0]?.message?.function_call?.arguments;
    if (!result) {
      throw new Error('Failed to generate report');
    }

    return JSON.parse(result);
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate medical report');
  }
}