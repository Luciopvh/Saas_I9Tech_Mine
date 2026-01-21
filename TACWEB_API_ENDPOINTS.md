# 📚 Documentação Completa: Endpoints da API Tacweb

## 📋 Índice
- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Lista de Endpoints](#lista-de-endpoints)
- [Parâmetros Comuns](#parâmetros-comuns)
- [Exemplos de Uso](#exemplos-de-uso)
- [Respostas e Formatos](#respostas-e-formatos)

---

## 🌐 Informações Gerais

### Base URL
```
https://api.tacweb.com.br
```

### Versão da API
```
WebService v1.9
```

### Formato de Resposta
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_records": 250,
    "per_page": 25
  }
}
```

---

## 🔐 Autenticação

### Tipo: Bearer Token
```http
Authorization: Bearer {seu-token-jwt}
```

### Onde obter o token
1. Acesse o portal Tacweb
2. Vá em Configurações > API
3. Gere um novo token de acesso
4. Copie o token e use nas requisições

---

## 📌 Lista de Endpoints

### **1. Consumo por Utilização** (Item 04)
```http
GET /consumo/utilizacao
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página (padrão: 1) |
| `per_page` | integer | Não | Itens por página (padrão: 25) |
| `data_inicio` | date | Não | Data inicial (formato: YYYY-MM-DD) |
| `data_fim` | date | Não | Data final (formato: YYYY-MM-DD) |
| `equipamento_id` | integer | Não | Filtrar por ID do equipamento |

**Exemplo de URL:**
```
GET /consumo/utilizacao?page=1&per_page=25&data_inicio=2024-01-01&data_fim=2024-01-31
```

**Resposta Exemplo:**
```json
{
  "data": [
    {
      "id": 123,
      "equipamento_id": 456,
      "equipamento_nome": "Escavadeira CAT 320",
      "data": "2024-01-15",
      "horimetro_inicial": 1000.5,
      "horimetro_final": 1008.5,
      "horas_trabalhadas": 8.0,
      "consumo_litros": 64.5,
      "consumo_por_hora": 8.06,
      "operador": "João Silva",
      "obra": "Construção ABC"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_records": 125,
    "per_page": 25
  }
}
```

---

### **2. Consumo por Abastecimento** (Item 05)
```http
GET /consumo/abastecimento
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `per_page` | integer | Não | Itens por página |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |
| `tipo_combustivel` | string | Não | diesel, gasolina, etanol |

**Exemplo de URL:**
```
GET /consumo/abastecimento?page=1&tipo_combustivel=diesel
```

---

### **3. Consumo por Período** (Item 06)
```http
GET /consumo/periodo
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `periodo` | string | Sim | diario, semanal, mensal |
| `data_inicio` | date | Sim | Data inicial |
| `data_fim` | date | Sim | Data final |

**Exemplo de URL:**
```
GET /consumo/periodo?periodo=mensal&data_inicio=2024-01-01&data_fim=2024-12-31
```

---

### **4. Consumo por Equipamento** (Item 07)
```http
GET /consumo/equipamento
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `per_page` | integer | Não | Itens por página |
| `equipamento_id` | integer | Não | ID específico do equipamento |
| `categoria` | string | Não | pesado, leve, administrativo |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/equipamento?equipamento_id=456&data_inicio=2024-01-01
```

---

### **5. Consumo por Obra** (Item 08)
```http
GET /consumo/obra
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `obra_id` | integer | Não | ID da obra |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/obra?obra_id=789&data_inicio=2024-01-01
```

---

### **6. Consumo por Centro de Custo** (Item 09)
```http
GET /consumo/centro-custo
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `centro_custo_id` | integer | Não | ID do centro de custo |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/centro-custo?centro_custo_id=100
```

---

### **7. Consumo por Tipo de Equipamento** (Item 10)
```http
GET /consumo/tipo-equipamento
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `tipo_id` | integer | Não | ID do tipo de equipamento |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/tipo-equipamento?tipo_id=5
```

---

### **8. Consumo por Grupo de Equipamento** (Item 11)
```http
GET /consumo/grupo-equipamento
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `grupo_id` | integer | Não | ID do grupo |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/grupo-equipamento?grupo_id=3
```

---

### **9. Consumo por Empresa** (Item 12)
```http
GET /consumo/empresa
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `empresa_id` | integer | Não | ID da empresa |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/empresa?empresa_id=1
```

---

### **10. Consumo Consolidado** (Item 13)
```http
GET /consumo/consolidado
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `data_inicio` | date | Sim | Data inicial |
| `data_fim` | date | Sim | Data final |
| `agrupar_por` | string | Não | equipamento, obra, empresa |

**Exemplo de URL:**
```
GET /consumo/consolidado?data_inicio=2024-01-01&data_fim=2024-01-31&agrupar_por=obra
```

---

### **11. Consumo por Motorista/Operador** (Item 14)
```http
GET /consumo/motorista
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `motorista_id` | integer | Não | ID do motorista/operador |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/motorista?motorista_id=50
```

---

### **12. Consumo por Veículo** (Item 15)
```http
GET /consumo/veiculo
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `veiculo_id` | integer | Não | ID do veículo |
| `placa` | string | Não | Placa do veículo |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/veiculo?placa=ABC1234
```

---

### **13. Consumo por Frota** (Item 16)
```http
GET /consumo/frota
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `frota_id` | integer | Não | ID da frota |
| `data_inicio` | date | Não | Data inicial |
| `data_fim` | date | Não | Data final |

**Exemplo de URL:**
```
GET /consumo/frota?frota_id=10
```

---

### **14. Configuração de Equipamento** (Item 17)
```http
GET /configuracao/equipamento
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `page` | integer | Não | Número da página |
| `equipamento_id` | integer | Não | ID do equipamento |
| `ativo` | boolean | Não | true ou false |

**Exemplo de URL:**
```
GET /configuracao/equipamento?ativo=true
```

**Resposta Exemplo:**
```json
{
  "data": [
    {
      "id": 456,
      "codigo": "ESC001",
      "nome": "Escavadeira CAT 320",
      "tipo": "Escavadeira",
      "grupo": "Equipamentos Pesados",
      "fabricante": "Caterpillar",
      "modelo": "320D",
      "ano_fabricacao": 2020,
      "numero_serie": "CAT0DX00001",
      "capacidade_tanque": 400.0,
      "consumo_medio_esperado": 8.5,
      "horimetro_atual": 1500.5,
      "ativo": true,
      "data_aquisicao": "2020-03-15",
      "valor_aquisicao": 450000.00
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_records": 75,
    "per_page": 25
  }
}
```

---

## 🔄 Parâmetros Comuns

### Paginação
Todos os endpoints que retornam listas suportam paginação:

| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| `page` | integer | 1 | Número da página |
| `per_page` | integer | 25 | Registros por página (máx: 100) |

### Filtros de Data
Maioria dos endpoints aceita filtros de período:

| Parâmetro | Tipo | Formato | Descrição |
|-----------|------|---------|-----------|
| `data_inicio` | date | YYYY-MM-DD | Data inicial do período |
| `data_fim` | date | YYYY-MM-DD | Data final do período |

### Ordenação
```
?order_by=campo&order=asc|desc
```

Exemplo:
```
GET /consumo/equipamento?order_by=consumo_litros&order=desc
```

---

## 💡 Exemplos de Uso

### Exemplo 1: Obter consumo por equipamento do último mês
```bash
curl -X GET "https://api.tacweb.com.br/consumo/equipamento?data_inicio=2024-01-01&data_fim=2024-01-31&page=1" \
  -H "Authorization: Bearer seu-token-jwt-aqui" \
  -H "Content-Type: application/json"
```

### Exemplo 2: Listar configurações de equipamentos ativos
```bash
curl -X GET "https://api.tacweb.com.br/configuracao/equipamento?ativo=true" \
  -H "Authorization: Bearer seu-token-jwt-aqui" \
  -H "Content-Type: application/json"
```

### Exemplo 3: Consumo consolidado por obra
```bash
curl -X GET "https://api.tacweb.com.br/consumo/consolidado?data_inicio=2024-01-01&data_fim=2024-12-31&agrupar_por=obra" \
  -H "Authorization: Bearer seu-token-jwt-aqui" \
  -H "Content-Type: application/json"
```

### Exemplo 4: Buscar abastecimentos de diesel com paginação
```bash
curl -X GET "https://api.tacweb.com.br/consumo/abastecimento?tipo_combustivel=diesel&page=2&per_page=50" \
  -H "Authorization: Bearer seu-token-jwt-aqui" \
  -H "Content-Type: application/json"
```

---

## 📊 Respostas e Formatos

### Resposta de Sucesso (200 OK)
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_records": 250,
    "per_page": 25
  },
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.9"
  }
}
```

### Resposta de Erro (400 Bad Request)
```json
{
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "O parâmetro 'data_inicio' é obrigatório",
    "details": {
      "parameter": "data_inicio",
      "expected": "YYYY-MM-DD"
    }
  }
}
```

### Resposta de Erro (401 Unauthorized)
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticação inválido ou expirado"
  }
}
```

### Resposta de Erro (404 Not Found)
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Equipamento não encontrado",
    "details": {
      "equipamento_id": 999
    }
  }
}
```

### Resposta de Erro (429 Too Many Requests)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de requisições excedido",
    "details": {
      "limit": 1000,
      "window": "1h",
      "retry_after": 300
    }
  }
}
```

---

## 🔒 Rate Limiting

### Limites por Tenant
- **Requisições por hora**: 1.000
- **Requisições por minuto**: 100
- **Requisições simultâneas**: 10

### Headers de Rate Limit
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 850
X-RateLimit-Reset: 1704531600
```

---

## 📝 Notas Importantes

1. **Janela Temporal Padrão**: Quando `data_inicio` e `data_fim` não são especificados, a API retorna dados das últimas 24-30 horas.

2. **Paginação**: Para evitar timeouts, recomenda-se usar paginação com `per_page` máximo de 100 registros.

3. **Formato de Datas**: Sempre use o formato ISO 8601 (YYYY-MM-DD) para datas.

4. **Campos Opcionais**: Campos não obrigatórios podem retornar `null` nas respostas.

5. **Idempotência**: Todas as requisições GET são idempotentes e podem ser repetidas com segurança.

6. **Cache**: Respostas podem ser cacheadas por até 5 minutos. Use o header `Cache-Control` para controlar o cache.

7. **Versionamento**: A versão da API é especificada na URL base. Mudanças incompatíveis resultarão em nova versão (ex: v2.0).

---

## 🆘 Suporte

Para dúvidas ou problemas com a API Tacweb:

- **Documentação Oficial**: https://docs.tacweb.com.br
- **Suporte Técnico**: suporte@tacweb.com.br
- **Portal**: https://portal.tacweb.com.br

---

**Última atualização**: 06/01/2025  
**Versão da API**: 1.9  
**Documento gerado para**: Sistema de Integração Multi-Tenant Tacweb
