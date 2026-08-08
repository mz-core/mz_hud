# Documentação - mz_hud

> Editor visual v2: consulte [VISUAL_EDITOR.md](VISUAL_EDITOR.md) para arquitetura, schema, draft, SMART visibility, testes e checklist FiveM.

Bem-vindo à documentação da HUD global `mz_hud` para servidores `mz_core`.

## 📋 Índice rápido

| Guia                                             | Descrição                                       |
| ------------------------------------------------ | ----------------------------------------------- |
| **[INSTALLATION.md](INSTALLATION.md)**           | Como instalar e fazer primeiro setup            |
| **[COMMANDS.md](COMMANDS.md)**                   | Referência completa de comandos administrativos |
| **[EDITOR_GUIDE.md](EDITOR_GUIDE.md)**           | Como usar o editor visual `/mzhud`              |
| **[PRODUCTION_MODE.md](PRODUCTION_MODE.md)**     | Boas práticas em servidor de produção           |
| **[ADMIN_TOOLS.md](ADMIN_TOOLS.md)**             | Ferramentas de diagnóstico, backups e auditoria |
| **[PRESETS.md](PRESETS.md)**                     | Documentação sobre presets prontos              |
| **[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)** | Checklist pré-release                           |

## 📚 Por caso de uso

### 🚀 Instalação e primeiros passos

1. Comece com [INSTALLATION.md](INSTALLATION.md)
2. Execute `/mzhud_diag` (descrito em [ADMIN_TOOLS.md](ADMIN_TOOLS.md))
3. Abra `/mzhud` e consulte [EDITOR_GUIDE.md](EDITOR_GUIDE.md)
4. Crie um backup: `/mzhud_backup create instalacao-inicial`
5. Aplique um preset: `/mzhud_preset list` e escolha um

### ⚙️ Configurar a HUD visualmente

1. Leia [EDITOR_GUIDE.md](EDITOR_GUIDE.md)
2. Execute `/mzhud`
3. Ajuste conforme necessário
4. Sempre crie backup antes: `/mzhud_backup create descricao`
5. Verifique com `/mzhud_diag` após alterar

### 🎨 Customizar estilos e presets

1. Consulte [PRESETS.md](PRESETS.md) para presets disponíveis
2. Veja [STYLES_CATALOG.md](STYLES_CATALOG.md) para estilos disponíveis
3. Se quer criar novo estilo, leia a seção "Como criar novo estilo" em [STYLES_CATALOG.md](STYLES_CATALOG.md)
4. Para ícones, consulte [ICON_SYSTEM.md](ICON_SYSTEM.md)

### 🛠️ Editar código com segurança

1. Leia [SAFE_EDITING.md](SAFE_EDITING.md) - lista o que é seguro mexer
2. Inclui organização de CSS em [SAFE_EDITING.md](SAFE_EDITING.md)
3. Teste com checklist fornecido no mesmo arquivo

### 📊 Produção e manutenção

1. Antes de ir para produção, execute [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
2. Em produção, siga [PRODUCTION_MODE.md](PRODUCTION_MODE.md)
3. Use ferramentas em [ADMIN_TOOLS.md](ADMIN_TOOLS.md):
   - `/mzhud_backup` para proteger configuração
   - `/mzhud_diag` para verificar saúde
   - `/mzhud` para gerenciar auditoria

### 🔧 Desenvolvedor/Debug

1. Comece com [STRUCTURE.md](STRUCTURE.md) para entender a arquitetura
2. Leia [SAFE_EDITING.md](SAFE_EDITING.md) - lista arquivos críticos
3. Para CSS, veja seção de organização CSS em [SAFE_EDITING.md](SAFE_EDITING.md)
4. Sempre use [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) para validação

---

## 📁 Estrutura de documentação

### Guias Essenciais

- **[INSTALLATION.md](INSTALLATION.md)** - Setup inicial do resource
- **[COMMANDS.md](COMMANDS.md)** - Todos os comandos administrativos
- **[EDITOR_GUIDE.md](EDITOR_GUIDE.md)** - Interface visual do editor

### Guias Operacionais

- **[PRODUCTION_MODE.md](PRODUCTION_MODE.md)** - Trabalhar em produção com segurança
- **[ADMIN_TOOLS.md](ADMIN_TOOLS.md)** - Ferramentas admin: diagnóstico, backups, auditoria
- **[PRESETS.md](PRESETS.md)** - Presets prontos e como usá-los

### Guias de Desenvolvimento

- **[STRUCTURE.md](STRUCTURE.md)** - Arquitetura do projeto
- **[SAFE_EDITING.md](SAFE_EDITING.md)** - O que é seguro editar, checklist de testes
  - Inclui seção de organização CSS
- **[STYLES_CATALOG.md](STYLES_CATALOG.md)** - Catálogo de estilos existentes
  - Inclui seção "Como criar novo estilo"
- **[ICON_SYSTEM.md](ICON_SYSTEM.md)** - Sistema de ícones da HUD

### Manutenção e Histórico

- **[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)** - Validação pré-release
- **[CHANGELOG.md](CHANGELOG.md)** - Histórico de alterações do projeto

### Dados operacionais

- **[presets/](presets/)** - Arquivos JSON de presets para referência

---

## 🎯 Tarefas comuns

### "Quero aplicar um preset"

```
/mzhud_preset list
/mzhud_preset apply clean_minimal
```

Leia [PRESETS.md](PRESETS.md) e [COMMANDS.md](COMMANDS.md).

### "Como editar a HUD visualmente?"

```
/mzhud
```

Leia [EDITOR_GUIDE.md](EDITOR_GUIDE.md).

### "Algo deu errado, como voltar?"

```
/mzhud_backup restore latest
/mzhud_diag
```

Leia [ADMIN_TOOLS.md](ADMIN_TOOLS.md) e [PRODUCTION_MODE.md](PRODUCTION_MODE.md).

### "Quero editar arquivo fonte"

Leia [SAFE_EDITING.md](SAFE_EDITING.md) primeiro. Lista o que é seguro mexer e o que exige cuidado.

### "Preciso criar um novo estilo visual"

Leia [STYLES_CATALOG.md](STYLES_CATALOG.md) - seção "Como criar novo estilo".

### "Como adicionar novo ícone?"

Leia [ICON_SYSTEM.md](ICON_SYSTEM.md).

### "Vou para produção, o que checar?"

Execute o [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) completo.

---

## ⚠️ Regras importantes

- **HUD é global** - Não existem configurações por player
- **Backup sempre** - Antes de qualquer alteração grande, crie backup: `/mzhud_backup create descricao`
- **Testar após editar** - Use checklist fornecido em [SAFE_EDITING.md](SAFE_EDITING.md)
- **Permissão** - Todos os comandos usam `group.mz_owner`
- **runtime_config.json** - Arquivo crítico, sempre em backup antes de mexer
- **Não renomear classes CSS** - Usado por JavaScript, mudanças quebram a HUD

---

## 📞 Suporte rápido

| Problema                 | Solução                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| HUD não aparece          | Leia [PRODUCTION_MODE.md](PRODUCTION_MODE.md) - seção "Se algo der errado" |
| Comando não funciona     | Verifique permissão `group.mz_owner`                                       |
| Visual estranho          | Execute `/mzhud_diag` e `/mzhud_reload`                                    |
| Não consegue editar      | Abra `/mzhud` e leia [EDITOR_GUIDE.md](EDITOR_GUIDE.md)                    |
| Quer voltar configuração | Use `/mzhud_backup restore latest`                                         |

---

**Última atualização**: Fase 10 (Release)
