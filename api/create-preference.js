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

function getBaseUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${req.headers.host}`;
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
  
  const { lotId, clientName, clientDni, clientEmail, clientPhone, reservationId } = req.body;
  
  if (!lotId || !clientName || !clientDni || !clientEmail || !clientPhone || !reservationId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (lotId, clientName, clientDni, clientEmail, clientPhone, reservationId)' });
  }

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado en el servidor.' });
  }

  try {
    const baseUrl = getBaseUrl(req);
    const returnPath = lotId.startsWith("D-") ? "/paracas-dome" : "/simulador";

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            id: `reserve-${lotId}`,
            title: `Separación de Lote - ${lotId.replace('-', ' ')}`,
            description: `Garantía de separación para el lote ${lotId} - Cliente: ${clientName}`,
            category_id: "real_estate",
            quantity: 1,
            currency_id: "PEN",
            unit_price: 1000
          }
        ],
        payer: {
          name: clientName,
          email: clientEmail,
          phone: {
            area_code: "51",
            number: clientPhone
          },
          identification: {
            type: "DNI",
            number: clientDni
          }
        },
        back_urls: {
          success: `${baseUrl}${returnPath}?reserveStatus=success&reserveLotId=${encodeURIComponent(lotId)}&reserveId=${encodeURIComponent(reservationId)}`,
          failure: `${baseUrl}${returnPath}?reserveStatus=failure&reserveId=${encodeURIComponent(reservationId)}`,
          pending: `${baseUrl}${returnPath}?reserveStatus=pending&reserveId=${encodeURIComponent(reservationId)}`
        },
        auto_return: "approved",
        statement_descriptor: "MOON PARACAS",
        external_reference: reservationId,
        metadata: {
          reservation_id: reservationId,
          lot_id: lotId
        },
        payment_methods: {
          installments: 12
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Mercado Pago API error response:", data);
      return res.status(500).json({ error: data.message || "Mercado Pago Preference Creation Failed" });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point
    });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
