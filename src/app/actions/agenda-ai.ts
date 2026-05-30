"use server"

import { ai } from "@/ai/genkit"

export async function generateWeeklyAgendaSynthesis(events: any[]) {
  if (!events || events.length === 0) {
    return "Aucun événement prévu pour cette semaine. Profitez-en pour vous concentrer sur vos tâches de fond !"
  }

  const eventListStr = events.map(e => `- ${new Date(e.date).toLocaleString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })} : ${e.title} (${e.description || 'Sans détail'})`).join('\n')

  try {
    const { text } = await ai.generate(`
Tu es l'assistant IA de l'agenda de l'utilisateur. C'est lundi matin.
Voici la liste de ses événements pour cette semaine :
${eventListStr}

Génère une notification très courte (2 phrases maximum) pour faire la synthèse de la semaine. Sois motivant et professionnel.
Concentre-toi sur les événements les plus proches ou les plus importants.
Ne mets pas de guillemets autour du texte.
    `)
    return text
  } catch (error) {
    console.error("Erreur génération Genkit:", error)
    return "C'est parti pour une nouvelle semaine ! N'oubliez pas de consulter votre agenda."
  }
}
