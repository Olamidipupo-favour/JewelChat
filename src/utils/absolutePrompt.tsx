interface PromptAttributes {
  metal?: string;
  stone?: string;
  setting?: string;
  style?: string;
  finish?: string;
  details?: string[];
}

export async function generateAbsolutePrompt(
  basePrompt: string,
  attributes: PromptAttributes,
  preserveStructure: boolean = true
): Promise<string> {
  // Create a structured prompt that maintains design integrity
  let structuredPrompt = basePrompt;

  // Add core attributes with precise weighting
  if (attributes.metal) {
    structuredPrompt += `, crafted in ${attributes.metal}`;
  }

  if (attributes.stone) {
    structuredPrompt += `, featuring ${attributes.stone}`;
  }

  if (attributes.setting) {
    structuredPrompt += `, with ${attributes.setting} setting`;
  }

  if (attributes.style) {
    structuredPrompt += `, in ${attributes.style} style`;
  }

  // Add optional refinements
  if (attributes.finish) {
    structuredPrompt += `, with ${attributes.finish} finish`;
  }

  if (attributes.details && attributes.details.length > 0) {
    structuredPrompt += `, incorporating ${attributes.details.join(', ')}`;
  }

  // Add photography specifications
  structuredPrompt = `Professional jewelry photography: ${structuredPrompt}, on white background, studio lighting, macro detail`;

  return structuredPrompt;
}

export function validateAttributes(attributes: PromptAttributes): boolean {
  // Validate required attributes
  if (!attributes.metal || !attributes.stone || !attributes.setting) {
    return false;
  }

  // Validate attribute combinations
  const validMetals = ['yellow gold', 'white gold', 'rose gold', 'platinum', 'silver'];
  const validSettings = ['prong', 'bezel', 'channel', 'pavé', 'tension'];

  return (
    validMetals.includes(attributes.metal.toLowerCase()) &&
    validSettings.includes(attributes.setting.toLowerCase())
  );
}

export function enhancePromptWithStructure(prompt: string): string {
  // Add structural emphasis to maintain design integrity
  return prompt.replace(
    /(setting|metal|stone|style)/gi,
    (match) => `primary:${match}`
  );
}