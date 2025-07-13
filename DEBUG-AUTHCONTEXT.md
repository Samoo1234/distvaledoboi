# Debug do AuthContext - Guia de Resolução

## 🔍 Como Verificar os Logs

1. **Abra o navegador** em http://localhost:3000
2. **Abra o DevTools** (F12 ou Ctrl+Shift+I)
3. **Vá para a aba Console**
4. **Recarregue a página** (F5)

## 📋 Logs Esperados

Você deve ver uma sequência de logs como:

```
🔧 Configurando AuthContext...
📡 Buscando sessão atual...
📋 Sessão obtida: Ativa/Inativa
```

### Se houver usuário logado:
```
👤 Convertendo usuário...
🔍 Buscando perfil para usuário: email@exemplo.com ID: uuid-do-usuario
✅ Perfil encontrado: {role: 'admin', name: 'Nome do Usuario'}
👤 Usuário convertido: {id: 'uuid', email: 'email', name: 'Nome', role: 'admin'}
✅ Usuário logado: email@exemplo.com Role: admin
```

### Se houver erro:
```
⚠️ Erro ao buscar perfil do usuário: [mensagem do erro]
📊 Detalhes do erro: [objeto completo do erro]
📝 Usando role padrão: vendedor
```

## 🚨 Possíveis Problemas e Soluções

### 1. Erro "PGRST116" ou "relation does not exist"
**Problema:** Tabela `user_profiles` não existe
**Solução:** Execute o script SQL `corrigir-roles-usuarios.sql` no Supabase

### 2. Erro "Row Level Security"
**Problema:** Políticas RLS muito restritivas
**Solução:** Verificar políticas da tabela `user_profiles`

### 3. Usuário não encontrado na tabela
**Problema:** Perfil não existe para o usuário
**Solução:** Execute o script para criar perfis:

```sql
-- No SQL Editor do Supabase
INSERT INTO user_profiles (id, role, name, email, active) 
VALUES (
    'ID_DO_USUARIO_AQUI',
    'separacao', -- ou 'admin'
    'Nome do Usuario',
    'email@exemplo.com',
    true
);
```

### 4. Erro de conexão com Supabase
**Problema:** Variáveis de ambiente incorretas
**Solução:** Verificar arquivo `.env`

## 🔧 Próximos Passos

1. **Verifique os logs** no console
2. **Identifique o erro específico**
3. **Execute a solução correspondente**
4. **Teste novamente**

## 📞 Informações para Debug

Se precisar de ajuda, forneça:
- **Logs completos** do console
- **Email do usuário** que está tentando logar
- **Erro específico** que aparece
- **Role esperado** para o usuário

---

**Nota:** Os logs detalhados foram adicionados temporariamente para debug. Após resolver o problema, eles podem ser removidos para limpar o console.