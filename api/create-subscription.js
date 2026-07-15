function setCors(req, res) {
  const origin = req.headers.origin;
  const allowedOrigin =
    origin && (origin.includes('localhost') || origin.endsWith('.vercel.app') || origin === process.env.APP_URL)
      ? origin
      : process.env.APP_URL || '';

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { lotId, clientName, clientEmail, clientPhone, monthlyAmount, installmentsCount, reservationId } = req.body;
  
  if (!lotId || !clientName || !clientEmail || !clientPhone || !monthlyAmount || !installmentsCount || !reservationId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (lotId, clientName, clientEmail, clientPhone, monthlyAmount, installmentsCount, reservationId)' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado en el servidor.' });
  }

  try {
    // Round monthlyAmount to 2 decimal places as required by Mercado Pago
    const roundedMonthlyAmount = Math.round(parseFloat(monthlyAmount) * 100) / 100;
    const roundedInstallmentsCount = parseInt(installmentsCount, 10);

    if (roundedMonthlyAmount > 1500) {
      return res.status(400).json({
        error: 'Mercado Pago Preapproval limita el cobro recurrente a S/ 1,500. Usa checkout directo o divide el cronograma comercial fuera de preapproval.'
      });
    }

    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reason: `Financiamiento Lote ${lotId.replace('-', ' ')} - Moon Paracas`,
        external_reference: reservationId,
        payer_email: clientEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: roundedMonthlyAmount,
          currency_id: "PEN",
          repetitions: roundedInstallmentsCount,
          setup_fee: 1000 // Charging S/ 1,000 immediately as lot separation fee
        },
        back_url: `https://moon-paracas.vercel.app/simulador?reserveStatus=success&reserveLotId=${lotId}&reserveId=${reservationId}`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Mercado Pago Pre-approval API error response:", data);
      return res.status(500).json({ error: data.message || "Mercado Pago Subscription Creation Failed" });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point
    });
  } catch (error) {
    console.error("Error creating Mercado Pago subscription:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
