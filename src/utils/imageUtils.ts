export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function generateStabilityAIPrompt(
  basePrompt: string,
  attributes?: {
    metal?: string;
    stone?: string;
    setting?: string;
    style?: string;
  }
): string {
  let prompt = `Professional jewelry photography: ${basePrompt}`;

  if (attributes) {
    const details = Object.entries(attributes)
      .filter(([_, value]) => value)
      .map(([key, value]) => value)
      .join(', ');

    if (details) {
      prompt += `, featuring ${details}`;
    }
  }

  return `${prompt}, on white background, studio lighting, macro detail`;
}