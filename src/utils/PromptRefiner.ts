import OpenAI from 'openai';

interface RefinementOptions {
  preserveElements?: {
    metal?: boolean;
    stone?: boolean;
    setting?: boolean;
    style?: boolean;
  };
  allowedChanges?: {
    finish?: boolean;
    texture?: boolean;
    detailing?: boolean;
    stoneShape?: boolean;
  };
}

export async function refinePrompt(
  input: string,
  options: RefinementOptions = {
    preserveElements: {
      metal: true,
      stone: true,
      setting: true,
      style: true
    },
    allowedChanges: {
      finish: true,
      texture: true,
      detailing: true,
      stoneShape: true
    }
  }
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const systemPrompt = `You are a jewelry design expert. Refine the given jewelry design prompt while:

1. PRESERVING these core elements (do not change):
${options.preserveElements?.metal ? '- Metal type (e.g., gold, platinum)' : ''}
${options.preserveElements?.stone ? '- Stone type (e.g., diamond, sapphire)' : ''}
${options.preserveElements?.setting ? '- Setting style (e.g., prong, bezel)' : ''}
${options.preserveElements?.style ? '- Overall design style' : ''}

2. ALLOWING subtle variations in:
${options.allowedChanges?.finish ? '- Metal finish (e.g., polished, brushed)' : ''}
${options.allowedChanges?.texture ? '- Surface texture' : ''}
${options.allowedChanges?.detailing ? '- Minor decorative elements' : ''}
${options.allowedChanges?.stoneShape ? '- Stone shape (within same family)' : ''}

3. CRITICAL RULES:
- Keep the fundamental design intact
- No drastic style changes
- No additional stones or elements
- Maintain luxury jewelry standards
- Focus on subtle refinements only

Return ONLY the refined prompt, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: input
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content || input;
  } catch (error) {
    console.error('Error refining prompt:', error);
    return input; // Return original input if refinement fails
  }
}

export async function analyzeImage(imageBase64: string): Promise<{
  description: string;
  attributes: {
    metal?: string;
    stone?: string;
    setting?: string;
    style?: string;
  };
}> {
  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `Analyze this jewelry image and extract key attributes. Return a JSON object with:
{
  "description": "Detailed description of the piece",
  "attributes": {
    "metal": "Metal type and color",
    "stone": "Main stone type",
    "setting": "Setting style",
    "style": "Overall design style"
  }
}`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No analysis received');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}