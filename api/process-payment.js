import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Idempotency-Key'
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

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado en el servidor.' });
  }

  const { paymentData: brickPaymentData, reservationId, lotId, clientName } = req.body || {};
  const paymentData = brickPaymentData || req.body;
  const externalReference = reservationId || paymentData?.external_reference;
  const selectedLotId = lotId || paymentData?.metadata?.lot_id;

  if (!paymentData || !externalReference || !selectedLotId) {
    return res.status(400).json({ error: 'Faltan datos requeridos (paymentData, reservationId, lotId).' });
  }

  const safePaymentData = {
    ...paymentData,
    transaction_amount: 1000,
    description: `Separación de Lote - ${selectedLotId}${clientName ? ` - Cliente: ${clientName}` : ''}`,
    external_reference: externalReference,
    statement_descriptor: 'MOON PARACAS',
    metadata: {
      ...(paymentData.metadata || {}),
      reservation_id: externalReference,
      lot_id: selectedLotId
    }
  };

  const idempotencyKey = req.headers['x-idempotency-key'] || externalReference;

  try {
    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(safePaymentData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Mercado Pago Payment API error:", JSON.stringify(data));
      return res.status(response.status).json({
        error: data.message || "Payment processing failed",
        cause: data.cause || [],
        status: data.status
      });
    }

    let firestoreSynced = false;
    if (data.status === "approved") {
      try {
        const lotCollection = selectedLotId.startsWith("D-") ? "dome_lots" : "lots";
        await updateDoc(doc(db, lotCollection, selectedLotId), { status: "reserved" });
        await updateDoc(doc(db, "reservations", externalReference), {
          status: "paid",
          paidAt: new Date().toISOString(),
          mpPaymentId: data.id,
          mpPaymentType: data.payment_type_id,
          mpPaymentMethod: data.payment_method_id,
          mpNetAmount: data.transaction_details?.net_received_amount || data.transaction_amount || 1000
        });
        firestoreSynced = true;
      } catch (syncError) {
        console.error("Payment approved but Firestore sync failed:", syncError);
      }
    }

    return res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      payment_method_id: data.payment_method_id,
      payment_type_id: data.payment_type_id,
      transaction_amount: data.transaction_amount,
      external_reference: data.external_reference,
      firestoreSynced
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
