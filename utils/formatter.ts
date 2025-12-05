import { ExtractedOrderData } from "../types";

export const generateProductionOrderText = (data: ExtractedOrderData): string => {
  return `**Pedido #${data.orderId}**

> **PRODUÇÃO - DADOS TÉCNICOS**
> **SKU:** ${data.sku}
> **Produto:** ${data.rawColor} | Tam: ${data.productSize}
> **Bordado:** ${data.embroideryPosition} (${data.petCount} pets)
> **Texto:** ${data.optionalText !== "Não informado" ? data.optionalText : "_Sem texto_"}
> **[📂 ABRIR FOTO DE REFERÊNCIA](${data.imageLink})**

---

## 🎨 Fase 1: Designer (W)
- [ ] Baixar foto de referência
- [ ] Criar arquivo de bordado (.DST)
- [ ] **Upload do arquivo no sistema interno**
- [ ] Gerar mockup para cliente
- [ ] Enviar para aprovação
- [ ] **Aguardar cliente aprovar**

## 🧵 Fase 2: Produção (Roney)
- [ ] Verificar se arte está aprovada
- [ ] Separar peça física (Cor: ${data.rawColor} / Tam: ${data.productSize})
- [ ] Executar bordado
- [ ] Cortar linhas e limpar peça
- [ ] **Devolver peça para Base/Admin**

## 📦 Fase 3: Logística (Interno)
- [ ] Receber peça do Roney
- [ ] Conferência de qualidade final
- [ ] Embalar
- [ ] Gerar etiqueta de envio

---

### 🔒 Dados de Envio (Apenas Admin)
**Cliente:** ${data.customerName}
**Endereço:** ${data.shippingAddress}
`;
};