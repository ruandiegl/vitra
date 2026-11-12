import { PrismaClient, Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { starterTemplates } from "../src/lib/sites/templates";

const prisma = new PrismaClient();
const json = (value: unknown) => value as Prisma.InputJsonValue;

async function main() {
  const plans = [
    {
      slug: "essencial",
      name: "Essencial",
      description: "Tudo para colocar seu negócio no ar com uma página profissional.",
      priceCents: 4990,
      minisiteLimit: 1,
      blockLimit: 30,
      templateLimit: 20,
      storageLimitMb: 100,
      features: ["1 minisite", "Editor completo", "Estatísticas essenciais", "QR Code"],
      position: 0,
    },
    {
      slug: "studio",
      name: "Studio",
      description: "Mais espaço e identidade própria para negócios em crescimento.",
      priceCents: 9990,
      minisiteLimit: 3,
      blockLimit: 100,
      templateLimit: 50,
      storageLimitMb: 1024,
      removableBranding: true,
      features: ["3 minisites", "Até 100 blocos por site", "Sem marca Vitra", "1 GB de imagens"],
      position: 1,
    },
    {
      slug: "essencial-anual",
      name: "Essencial Anual",
      description: "O plano Essencial com pagamento anual.",
      priceCents: 47900,
      interval: "YEARLY" as const,
      minisiteLimit: 1,
      blockLimit: 30,
      templateLimit: 20,
      storageLimitMb: 100,
      features: ["1 minisite", "Editor completo", "Estatísticas essenciais", "QR Code"],
      position: 2,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: { position: plan.position },
      create: { ...plan, features: json(plan.features) },
    });
  }

  for (const template of starterTemplates) {
    await prisma.template.upsert({
      where: { slug: template.slug },
      update: { position: starterTemplates.indexOf(template) },
      create: {
        name: template.name,
        slug: template.slug,
        category: template.category,
        description: template.description,
        config: json({ config: template.config, theme: template.theme, blocks: template.blocks }),
        status: "PUBLISHED",
        featured: true,
        position: starterTemplates.indexOf(template),
      },
    });
  }

  const landingSections = [
    {
      section: "hero",
      position: 0,
      content: {
        headline: "Seu negócio merece mais do que um simples link na bio.",
        subtitle: "Crie um minisite profissional, personalize com a sua marca e reúna contatos, redes sociais e serviços em um só lugar. Tudo em poucos minutos.",
        primaryCta: "Criar meu minisite",
        secondaryCta: "Ver demonstração",
      },
    },
    {
      section: "how_it_works",
      position: 1,
      content: {
        title: "Do cadastro ao seu link publicado, sem complicação.",
        steps: [
          { title: "Crie sua conta", text: "Comece com seu nome e e-mail. Não pedimos cartão no teste." },
          { title: "Personalize seu minisite", text: "Escolha um modelo, adicione sua marca e organize seus links." },
          { title: "Publique e compartilhe", text: "Use sua URL exclusiva e o QR Code onde seus clientes estiverem." },
        ],
      },
    },
    {
      section: "features",
      position: 2,
      content: {
        title: "Uma vitrine completa. Um editor que não atrapalha.",
        items: ["Editor com prévia em tempo real", "Cores, fontes e temas da sua marca", "Logo e banners", "Botões para WhatsApp e redes sociais", "Link para avaliações do Google", "URL exclusiva e QR Code", "Visualizações e cliques", "Publicação e alterações rápidas"],
      },
    },
    {
      section: "faq",
      position: 4,
      content: {
        title: "Perguntas frequentes",
        items: [
          { question: "Preciso saber programar?", answer: "Não. Você preenche campos, escolhe cores e organiza blocos. A prévia mostra o resultado antes da publicação." },
          { question: "Posso personalizar meu minisite?", answer: "Sim. Logo, cores, fonte, textos, botões, banners, redes sociais e ordem dos blocos são personalizáveis." },
          { question: "Posso alterar os links depois de publicar?", answer: "Sim. Salve o rascunho e publique uma nova versão quando estiver pronto. O endereço continua o mesmo." },
          { question: "Meu minisite funciona no celular?", answer: "Sim. As páginas são responsivas e pensadas primeiro para a navegação mobile." },
          { question: "Posso cancelar minha assinatura?", answer: "Sim. Você pode solicitar o cancelamento no painel. O acesso segue até o fim do período já pago e seus dados são preservados conforme a política de retenção." },
          { question: "O que acontece se meu pagamento atrasar?", answer: "A assinatura entra em atraso e novas publicações ficam bloqueadas. A edição e o site público seguem durante a tolerância configurada; depois, o acesso é suspenso sem exclusão imediata dos dados." },
          { question: "Posso criar mais de um minisite?", answer: "Depende do limite do plano contratado. Você pode consultar e alterar seu plano na área de assinatura." },
        ],
      },
    },
    {
      section: "footer",
      position: 5,
      content: { supportEmail: "suporte@example.com", whatsapp: "", instagram: "", description: "Minisites profissionais para pequenos negócios." },
    },
    {
      section: "seo",
      position: 6,
      content: { title: "Vitra — seu negócio em uma página profissional", description: "Crie e publique um minisite com seus links, serviços, redes sociais e identidade visual." },
    },
  ];

  for (const item of landingSections) {
    await prisma.landingContent.upsert({
      where: { section: item.section },
      update: {},
      create: { section: item.section, position: item.position, content: json(item.content) },
    });
  }

  await prisma.appSetting.upsert({
    where: { key: "platform" },
    update: {},
    create: { key: "platform", value: json({ name: "Vitra", accessPolicy: "TRIAL", trialDays: 7, graceDays: 3 }) },
  });

  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          name: "Administração Vitra",
          email,
          passwordHash: await bcrypt.hash(password, 12),
          emailVerified: new Date(),
          role: UserRole.SUPER_ADMIN,
        },
      });
      console.log(`Administrador local criado: ${email}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
