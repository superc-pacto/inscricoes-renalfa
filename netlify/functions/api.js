exports.handler = async function(event) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ erro: "Método não permitido." }) };
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const token = process.env.RENALFA_API_TOKEN;

  if (!scriptUrl || !token) {
    return { statusCode: 500, headers, body: JSON.stringify({ erro: "A integração ainda não foi configurada no servidor." }) };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const upstream = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, token })
    });

    const raw = await upstream.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      return { statusCode: 502, headers, body: JSON.stringify({ erro: "O Google Apps Script não retornou uma resposta válida. Confira a implantação do servidor." }) };
    }

    return {
      statusCode: upstream.ok && !data.erro ? 200 : 400,
      headers,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ erro: "Falha de comunicação com o servidor de inscrições. Tente novamente." }) };
  }
};
