import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.chatbotRule.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.plan.deleteMany();

  await prisma.plan.createMany({
    data: [
      { name: 'Starter', slug: 'starter', price: 149, maxAgents: 3, maxChannels: 2, maxMessages: 1000, features: '["Unified Inbox","2 Channels","Basic Chatbot","Email Support"]' },
      { name: 'Professional', slug: 'professional', price: 399, maxAgents: 10, maxChannels: 5, maxMessages: 10000, features: '["Unified Inbox","All Channels","Advanced Chatbot","Auto Assignment","Analytics","Priority Support"]' },
      { name: 'Enterprise', slug: 'enterprise', price: 999, maxAgents: 999, maxChannels: 10, maxMessages: 999999, features: '["Unlimited Agents","All Channels","AI Chatbot","Custom Integrations","Dedicated Support","SLA Guarantee"]' },
    ],
  });

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@cberhunt.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'super_admin',
      online: true,
    },
  });

  const company1 = await prisma.company.create({
    data: {
      name: 'TechBrasil Ltda',
      email: 'contato@techbrasil.com',
      phone: '+55 11 3456-7890',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      plan: 'professional',
      active: true,
      welcomeMessage: 'Olá! Bem-vindo à TechBrasil. Como posso ajudá-lo?',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Loja Digital',
      email: 'suporte@lojadigital.com',
      phone: '+55 83 998367208',
      address: 'Rua das Flores, 250 - Rio de Janeiro, RJ',
      plan: 'starter',
      active: true,
    },
  });

  const company3 = await prisma.company.create({
    data: {
      name: 'ConsultMax',
      email: 'info@consultmax.com',
      phone: '+55 31 2222-3333',
      address: 'Belo Horizonte, MG',
      plan: 'enterprise',
      active: false,
      paymentStatus: 'overdue',
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      name: 'Carlos Silva',
      email: 'carlos@techbrasil.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'company_admin',
      companyId: company1.id,
      online: true,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@techbrasil.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'agent',
      companyId: company1.id,
      online: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'João Oliveira',
      email: 'joao@techbrasil.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'agent',
      companyId: company1.id,
      online: false,
    },
  });

  const agent3 = await prisma.user.create({
    data: {
      name: 'Ana Costa',
      email: 'ana@techbrasil.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'agent',
      companyId: company1.id,
      online: true,
    },
  });

  await prisma.user.create({
    data: {
      name: 'Pedro Lima',
      email: 'pedro@lojadigital.com',
      password: bcrypt.hashSync('123456', 10),
      role: 'company_admin',
      companyId: company2.id,
      online: true,
    },
  });

  const whatsapp = await prisma.channel.create({
    data: { type: 'whatsapp', name: 'WhatsApp Business', accountId: '+5511999990000', connected: true, companyId: company1.id },
  });

  const instagram = await prisma.channel.create({
    data: { type: 'instagram', name: 'Instagram DM', accountId: '@techbrasil', connected: true, companyId: company1.id },
  });

  const facebook = await prisma.channel.create({
    data: { type: 'facebook', name: 'Facebook Messenger', accountId: 'TechBrasil', connected: false, companyId: company1.id },
  });

  await prisma.channel.createMany({
    data: [
      { type: 'whatsapp', name: 'WhatsApp Business', accountId: '+5521988880000', connected: true, companyId: company2.id },
    ],
  });

  const conv1 = await prisma.conversation.create({
    data: {
      customerName: 'Lucas Ferreira',
      customerPhone: '+5511987654321',
      channel: 'whatsapp',
      status: 'open',
      unreadCount: 2,
      companyId: company1.id,
      channelId: whatsapp.id,
      agentId: agent1.id,
    },
  });

  const conv2 = await prisma.conversation.create({
    data: {
      customerName: 'Camila Rodrigues',
      customerEmail: 'camila@email.com',
      channel: 'instagram',
      status: 'open',
      unreadCount: 0,
      companyId: company1.id,
      channelId: instagram.id,
      agentId: agent3.id,
    },
  });

  const conv3 = await prisma.conversation.create({
    data: {
      customerName: 'Rafael Souza',
      customerPhone: '+5511912345678',
      channel: 'whatsapp',
      status: 'pending',
      unreadCount: 5,
      companyId: company1.id,
      channelId: whatsapp.id,
      agentId: agent2.id,
    },
  });

  const conv4 = await prisma.conversation.create({
    data: {
      customerName: 'Beatriz Almeida',
      channel: 'facebook',
      status: 'closed',
      unreadCount: 0,
      companyId: company1.id,
      channelId: facebook.id,
      agentId: agent1.id,
    },
  });

  const conv5 = await prisma.conversation.create({
    data: {
      customerName: 'Fernando Mendes',
      customerPhone: '+5511955556666',
      channel: 'whatsapp',
      status: 'open',
      unreadCount: 1,
      companyId: company1.id,
      channelId: whatsapp.id,
      agentId: agent3.id,
    },
  });

  const conv6 = await prisma.conversation.create({
    data: {
      customerName: 'Juliana Pereira',
      customerEmail: 'juliana.p@email.com',
      channel: 'instagram',
      status: 'open',
      unreadCount: 3,
      companyId: company1.id,
      channelId: instagram.id,
      agentId: null,
    },
  });

  const now = new Date();
  const mins = (m: number) => new Date(now.getTime() - m * 60000);

  await prisma.message.createMany({
    data: [
      { content: 'Olá, preciso de ajuda com meu pedido #1234', senderType: 'customer', conversationId: conv1.id, read: true, createdAt: mins(30) },
      { content: 'Olá Lucas! Claro, deixa eu verificar seu pedido.', senderType: 'agent', senderId: agent1.id, conversationId: conv1.id, read: true, createdAt: mins(28) },
      { content: 'Seu pedido está em trânsito e deve chegar amanhã.', senderType: 'agent', senderId: agent1.id, conversationId: conv1.id, read: true, createdAt: mins(27) },
      { content: 'Ótimo, obrigado! Mas posso alterar o endereço de entrega?', senderType: 'customer', conversationId: conv1.id, read: false, createdAt: mins(5) },
      { content: 'O prazo para alteração já passou?', senderType: 'customer', conversationId: conv1.id, read: false, createdAt: mins(3) },

      // { content: 'Oi, vi o produto no stories e quero saber o preço', senderType: 'customer', conversationId: conv2.id, read: true, createdAt: mins(60) },
      // { content: 'Olá Camila! Qual produto você viu?', senderType: 'agent', senderId: agent3.id, conversationId: conv2.id, read: true, createdAt: mins(55) },
      // { content: 'A bolsa marrom que vocês postaram ontem', senderType: 'customer', conversationId: conv2.id, read: true, createdAt: mins(50) },
      // { content: 'A bolsa Modelo Classic está por R$ 299,90. Quer que eu reserve para você?', senderType: 'agent', senderId: agent3.id, conversationId: conv2.id, read: true, createdAt: mins(48) },

      { content: 'Boa tarde, tenho uma reclamação', senderType: 'customer', conversationId: conv3.id, read: true, createdAt: mins(120) },
      { content: 'Comprei um produto e veio com defeito', senderType: 'customer', conversationId: conv3.id, read: true, createdAt: mins(119) },
      { content: 'Olá Rafael, sinto muito pelo inconveniente. Pode me enviar uma foto do produto?', senderType: 'agent', senderId: agent2.id, conversationId: conv3.id, read: true, createdAt: mins(100) },
      { content: 'Já enviei no WhatsApp. Quando vão resolver?', senderType: 'customer', conversationId: conv3.id, read: false, createdAt: mins(20) },
      { content: 'Estou aguardando resposta faz 1 hora', senderType: 'customer', conversationId: conv3.id, read: false, createdAt: mins(15) },
      { content: 'Vocês vão me responder?', senderType: 'customer', conversationId: conv3.id, read: false, createdAt: mins(10) },
      { content: 'Quero meu dinheiro de volta', senderType: 'customer', conversationId: conv3.id, read: false, createdAt: mins(5) },
      { content: 'Isso é um absurdo', senderType: 'customer', conversationId: conv3.id, read: false, createdAt: mins(2) },

      { content: 'Gostaria de fazer uma devolução', senderType: 'customer', conversationId: conv4.id, read: true, createdAt: mins(1440) },
      { content: 'Claro Beatriz. A devolução foi processada com sucesso. O reembolso será em até 5 dias úteis.', senderType: 'agent', senderId: agent1.id, conversationId: conv4.id, read: true, createdAt: mins(1400) },
      { content: 'Conversa encerrada pelo agente', senderType: 'system', conversationId: conv4.id, read: true, createdAt: mins(1399) },

      { content: 'E aí, vocês tem aquele produto em estoque?', senderType: 'customer', conversationId: conv5.id, read: true, createdAt: mins(45) },
      { content: 'Oi Fernando! Qual produto?', senderType: 'agent', senderId: agent3.id, conversationId: conv5.id, read: true, createdAt: mins(40) },
      { content: 'O fone bluetooth preto', senderType: 'customer', conversationId: conv5.id, read: false, createdAt: mins(8) },

      { content: 'Olá, gostaria de informações sobre planos empresariais', senderType: 'customer', conversationId: conv6.id, read: false, createdAt: mins(15) },
      { content: 'Vocês fazem desconto para compras acima de 50 unidades?', senderType: 'customer', conversationId: conv6.id, read: false, createdAt: mins(12) },
      { content: 'Preciso de resposta urgente', senderType: 'customer', conversationId: conv6.id, read: false, createdAt: mins(3) },
    ],
  });

  await prisma.chatbotRule.createMany({
    data: [
      { keyword: 'olá,oi,bom dia,boa tarde,boa noite', response: 'Olá! Bem-vindo à TechBrasil. Um atendente irá ajudá-lo em breve!', companyId: company1.id },
      { keyword: 'preço,valor,quanto custa,custo', response: 'Para informações sobre preços, por favor aguarde um momento que um atendente irá verificar para você.', companyId: company1.id },
      { keyword: 'horário,funcionamento,aberto', response: 'Nosso horário de atendimento é de segunda a sexta, das 08:00 às 18:00.', companyId: company1.id },
      { keyword: 'obrigado,obrigada,valeu,thanks', response: 'Agradecemos seu contato! Se precisar de mais alguma coisa, estamos à disposição.', companyId: company1.id },
      { keyword: 'reclamação,problema,defeito,quebrado', response: 'Sentimos muito pelo inconveniente. Vou encaminhar sua mensagem para nossa equipe de suporte prioritário.', companyId: company1.id },
    ],
  });
}

main()
  .then(() => {
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
