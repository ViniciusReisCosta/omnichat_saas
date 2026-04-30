import { prisma } from './prisma';

export async function getChatbotReply(
  companyId: string,
  message: string
): Promise<string | null> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return null;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  if (currentTime < company.businessHoursStart || currentTime > company.businessHoursEnd) {
    return `Nosso horário de atendimento é das ${company.businessHoursStart} às ${company.businessHoursEnd}. Retornaremos em breve!`;
  }

  const rules = await prisma.chatbotRule.findMany({
    where: { companyId, active: true },
  });

  const lowerMsg = message.toLowerCase();
  for (const rule of rules) {
    const keywords = rule.keyword.toLowerCase().split(',').map((k) => k.trim());
    if (keywords.some((kw) => lowerMsg.includes(kw))) {
      return rule.response;
    }
  }

  return null;
}
