'use server';
/**
 * @fileOverview Un agent IA qui analyse la santé technique globale du projet.
 * 
 * - techHealthAnalysis - Analyse les bugs et les notes pour évaluer la dette technique.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TechHealthInputSchema = z.object({
  bugs: z.array(z.object({
    title: z.string(),
    priority: z.string(),
    status: z.string(),
  })).describe('La liste des bugs actuels.'),
  recentNotes: z.array(z.string()).describe('Les titres des notes techniques récentes.'),
});
export type TechHealthInput = z.infer<typeof TechHealthInputSchema>;

const TechHealthOutputSchema = z.object({
  healthScore: z.number().describe('Un score de 0 à 100 (100 étant une santé parfaite).'),
  status: z.enum(['Optimal', 'Stable', 'Dégradé', 'Critique']).describe('Le statut global du système.'),
  summary: z.string().describe('Un résumé concis de la situation technique.'),
  recommendations: z.array(z.string()).describe('3 recommandations prioritaires pour réduire la dette.'),
});
export type TechHealthOutput = z.infer<typeof TechHealthOutputSchema>;

export async function getTechHealthAnalysis(input: TechHealthInput): Promise<TechHealthOutput> {
  return techHealthAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'techHealthAnalysisPrompt',
  input: {schema: TechHealthInputSchema},
  output: {schema: TechHealthOutputSchema},
  prompt: `Tu es un CTO virtuel expert en gestion de dette technique. Analyse l'état actuel du projet basé sur les bugs et les notes fournis.

Bugs actuels :
{{#each bugs}}
- [{{priority}}] {{title}} (Statut: {{status}})
{{/each}}

Notes récentes :
{{#each recentNotes}}
- {{this}}
{{/each}}

Évalue la santé globale du projet. Un nombre élevé de bugs "critiques" ou "haute priorité" doit faire chuter le score drastiquement.
Les notes récentes indiquent les domaines de recherche; si elles ne correspondent pas aux bugs, il y a peut-être un désalignement.

Retourne un score, un statut, un résumé et des recommandations actionnables.`,
});

const techHealthAnalysisFlow = ai.defineFlow(
  {
    name: 'techHealthAnalysisFlow',
    inputSchema: TechHealthInputSchema,
    outputSchema: TechHealthOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) throw new Error('Échec de l\'analyse de santé technique.');
    return output;
  }
);
