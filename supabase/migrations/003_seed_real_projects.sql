BEGIN;

-- Clean up existing projects (cascade handles project_members)
DELETE FROM activity_log WHERE entity_type = 'project' AND entity_id IN (
  SELECT id FROM projects WHERE name IN ('Vecto', 'Pulso', 'Casa Gestão', 'DuoPay')
);
DELETE FROM projects WHERE name IN ('Vecto', 'Pulso', 'Casa Gestão', 'DuoPay');

-- ═══════════════════════════════════════
-- PROJECT 1 — Vecto
-- ═══════════════════════════════════════
INSERT INTO projects (name, description, phase, status, thesis_type, thesis_hypothesis, launch_target, owner_id)
VALUES (
  'Vecto',
  'Plataforma de gestão de vida pessoal que centraliza 8 módulos integrados (finanças, saúde, hábitos, tarefas, estudos, trabalho, casa, social) com gamificação nativa baseada em ciência comportamental.',
  'mvp',
  'active',
  'b2c',
  'Profissionais de 20-40 anos frustrados com a fragmentação de 5-10 apps de produtividade vão adotar e pagar por uma plataforma única que enxerga as conexões entre áreas da vida, com Freeze Mode e gamificação profunda como diferenciais de retenção.',
  '2026-09-22',
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com')
);

INSERT INTO project_members (project_id, user_id, role_in_project)
VALUES
  ((SELECT id FROM projects WHERE name = 'Vecto'), (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'), 'owner'),
  ((SELECT id FROM projects WHERE name = 'Vecto'), (SELECT id FROM users WHERE email = 'felipe.alves@valkbr.com'), 'owner');

INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
VALUES (
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'),
  'created_project',
  'project',
  (SELECT id FROM projects WHERE name = 'Vecto'),
  jsonb_build_object('project_name', 'Vecto')
);

-- ═══════════════════════════════════════
-- PROJECT 2 — Pulso
-- ═══════════════════════════════════════
INSERT INTO projects (name, description, phase, status, thesis_type, thesis_hypothesis, launch_target, owner_id)
VALUES (
  'Pulso',
  'CRM white-label para PMEs (1-200 funcionários), com UX adaptável do operacional (vendedor) ao gestor. Mesma base funcional, visual customizável por cliente.',
  'discovery',
  'active',
  'b2b',
  'PMEs aceitam pagar por um CRM que combine simplicidade no operacional + robustez no gestor + identidade visual própria — diferencial que os CRMs atuais não entregam bem simultaneamente.',
  '2026-07-31',
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com')
);

INSERT INTO project_members (project_id, user_id, role_in_project)
VALUES
  ((SELECT id FROM projects WHERE name = 'Pulso'), (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'), 'owner'),
  ((SELECT id FROM projects WHERE name = 'Pulso'), (SELECT id FROM users WHERE email = 'felipe.alves@valkbr.com'), 'owner');

INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
VALUES (
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'),
  'created_project',
  'project',
  (SELECT id FROM projects WHERE name = 'Pulso'),
  jsonb_build_object('project_name', 'Pulso')
);

-- ═══════════════════════════════════════
-- PROJECT 3 — Casa Gestão
-- ═══════════════════════════════════════
INSERT INTO projects (name, description, phase, status, thesis_type, thesis_hypothesis, launch_target, owner_id)
VALUES (
  'Casa Gestão',
  'App de gestão financeira pessoal e familiar para o mercado brasileiro, com modularidade por perfil e narrativa de "gastos fantasmas". Core: onboarding adaptativo + gestão compartilhada casal/família.',
  'mvp',
  'active',
  'b2c',
  'Brasileiros (especialmente casais/famílias) pagam por um app financeiro que se adapta ao perfil em vez de forçar complexidade, e a dor de "gastos fantasmas" é forte o suficiente pra converter trial em assinatura paga.',
  '2026-05-03',
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com')
);

INSERT INTO project_members (project_id, user_id, role_in_project)
VALUES
  ((SELECT id FROM projects WHERE name = 'Casa Gestão'), (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'), 'owner'),
  ((SELECT id FROM projects WHERE name = 'Casa Gestão'), (SELECT id FROM users WHERE email = 'felipe.alves@valkbr.com'), 'owner');

INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
VALUES (
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'),
  'created_project',
  'project',
  (SELECT id FROM projects WHERE name = 'Casa Gestão'),
  jsonb_build_object('project_name', 'Casa Gestão')
);

-- ═══════════════════════════════════════
-- PROJECT 4 — DuoPay
-- ═══════════════════════════════════════
INSERT INTO projects (name, description, phase, status, thesis_type, thesis_hypothesis, launch_target, owner_id)
VALUES (
  'DuoPay',
  'App de gestão financeira nichado exclusivamente em casais, com foco em divisão de despesas, orçamento conjunto e transparência financeira entre parceiros. Posicionamento vertical (casais-only) em oposição a apps financeiros generalistas.',
  'discovery',
  'active',
  'b2c',
  'Existe demanda suficiente de casais por um produto financeiro vertical e exclusivo (não um app genérico com "modo casal"), e esse nicho converte melhor em aquisição paga do que um produto horizontal, justificando um SKU/posicionamento próprio.',
  '2026-05-03',
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com')
);

INSERT INTO project_members (project_id, user_id, role_in_project)
VALUES
  ((SELECT id FROM projects WHERE name = 'DuoPay'), (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'), 'owner'),
  ((SELECT id FROM projects WHERE name = 'DuoPay'), (SELECT id FROM users WHERE email = 'felipe.alves@valkbr.com'), 'owner');

INSERT INTO activity_log (user_id, action, entity_type, entity_id, metadata)
VALUES (
  (SELECT id FROM users WHERE email = 'igor.conrado@valkbr.com'),
  'created_project',
  'project',
  (SELECT id FROM projects WHERE name = 'DuoPay'),
  jsonb_build_object('project_name', 'DuoPay')
);

COMMIT;
