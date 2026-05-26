'use server';
/**
 * @fileOverview Un assistant IA pour générer des snippets de code à partir de descriptions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeGeneratorInputSchema = z.object({
  description: z.string().describe('La description du code à générer.'),
  language: z.string().optional().describe('Le langage de programmation souhaité.'),
});
export type CodeGeneratorInput = z.infer<typeof CodeGeneratorInputSchema>;

const CodeGeneratorOutputSchema = z.object({
  code: z.string().describe('Le code généré.'),
  title: z.string().describe('Un titre court pour le snippet.'),
  language: z.string().describe('Le langage détecté ou utilisé.'),
});
export type CodeGeneratorOutput = z.infer<typeof CodeGeneratorOutputSchema>;

export async function generateCodeSnippet(input: CodeGeneratorInput): Promise<CodeGeneratorOutput> {
  return codeGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeGeneratorPrompt',
  input: {schema: CodeGeneratorInputSchema},
  output: {schema: CodeGeneratorOutputSchema},
  prompt: `Tu es un expert en développement logiciel. Génère un snippet de code propre, efficace et bien commenté basé sur la description suivante.

Description : {{{description}}}
{{#if language}}Langage souhaité : {{{language}}}{{/if}}

Retourne le code, un titre technique concis et le langage exact utilisé.`,
});

const codeGeneratorFlow = ai.defineFlow(
  {
    name: 'codeGeneratorFlow',
    inputSchema: CodeGeneratorInputSchema,
    outputSchema: CodeGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error('Échec de la génération de code.');
    return output;
  }
);
