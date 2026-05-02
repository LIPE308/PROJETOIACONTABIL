const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// SERVE O FRONT
app.use(express.static("public"));

app.post("/gerar", async (req, res) => {
  try {
    const { texto } = req.body;

    // Prompt especializado para contabilidade
    const promptContabil = `Você é um assistente contábil especializado em classificação de lançamentos contábeis para o Brasil.

    Analise a seguinte transação e forneça APENAS as informações abaixo, uma por linha:
    - Débito/Crédito: [indique se é uma conta de natureza devedora ou credora]
    - Conta Contábil Sugerida: [nome da conta contábil mais adequada]
    - Histórico Padronizado: [um texto claro e objetivo para o lançamento, incluindo data se informada]
    - Valor: [valor da transação, se mencionado]

    Transação a classificar: "${texto}"

    Responda de forma direta e objetiva, sem introduções ou explicações adicionais.
    Use terminologia contábil brasileira padrão.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct-v0.1",
        messages: [
          {
            role: "system",
            content: "Você é um contador brasileiro especializado em classificação contábil."
          },
          {
            role: "user",
            content: promptContabil
          }
        ],
        max_tokens: 300,
        temperature: 0.3 // Baixa temperatura para respostas mais precisas
      })
    });

    const data = await response.json();

    console.log("🔎 RESPOSTA DA API:", JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      return res.json({ erro: data.error?.message || "Erro na API" });
    }

    // Extrair a resposta do formato do Chat Completion
    if (data.choices && data.choices[0]?.message?.content) {
      res.json([{ generated_text: data.choices[0].message.content }]);
    } else {
      res.json(data);
    }

  } catch (error) {
    console.error("💥 ERRO REAL COMPLETO:");
    console.error(error);
    res.json({ erro: "Erro no servidor" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Assistente Contábil rodando em: http://localhost:3000");
});