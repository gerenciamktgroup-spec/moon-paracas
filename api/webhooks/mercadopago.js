import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default async function handler(req, res) {
  // Always return 200 OK immediately to Mercado Pago to acknowledge notification receipt
  res.status(200).send("OK");

  if (req.method !== 'POST') {
    return;
  }

  const { type, data } = req.body;

  // We are interested in payment transactions
  if (type === 'payment' && data && data.id) {
    const paymentId = data.id;
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MERCADO_PAGO_ACCESS_TOKEN is not configured.");
      return;
    }

    try {
      // Fetch payment details directly from Mercado Pago API using the token
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      if (!mpResponse.ok) {
        console.error(`Failed to fetch payment details for ID ${paymentId} from Mercado Pago.`);
        return;
      }

      const paymentData = await mpResponse.json();

      const reservationId = paymentData.external_reference;
      const paymentStatus = paymentData.status; // e.g. "approved", "rejected", "pending"
      
      let lotId = paymentData.metadata?.lot_id || null;
      if (paymentData.items && paymentData.items.length > 0) {
        const itemId = paymentData.items[0].id;
        if (itemId && itemId.startsWith("reserve-")) {
          lotId = itemId.substring(8); // e.g. "LOTE-12"
        }
      }

      if (paymentStatus === 'approved' && reservationId && lotId) {
        console.log(`Webhook: Payment approved for reservation ${reservationId}, lot ${lotId}`);

        // 1. Update lot status to reserved
        const lotCollection = lotId.startsWith("D-") ? "dome_lots" : "lots";
        const lotRef = doc(db, lotCollection, lotId);
        await updateDoc(lotRef, {
          status: "reserved"
        });

        // 2. Update reservation record in Firestore
        const resRef = doc(db, "reservations", reservationId);
        await updateDoc(resRef, {
          status: "paid",
          paidAt: new Date().toISOString(),
          mpPaymentId: paymentId,
          mpPaymentType: paymentData.payment_type_id,
          mpPaymentMethod: paymentData.payment_method_id,
          mpNetAmount: paymentData.transaction_details?.net_received_amount || 1000
        });
      } else if (paymentStatus === 'approved' && reservationId) {
        const resRef = doc(db, "reservations", reservationId);
        const resSnap = await getDoc(resRef);
        const reservationLotId = resSnap.exists() ? resSnap.data().lotId : null;

        if (reservationLotId) {
          const lotCollection = reservationLotId.startsWith("D-") ? "dome_lots" : "lots";
          await updateDoc(doc(db, lotCollection, reservationLotId), { status: "reserved" });
          await updateDoc(resRef, {
            status: "paid",
            paidAt: new Date().toISOString(),
            mpPaymentId: paymentId,
            mpPaymentType: paymentData.payment_type_id,
            mpPaymentMethod: paymentData.payment_method_id,
            mpNetAmount: paymentData.transaction_details?.net_received_amount || 1000
          });
        }
      } else if ((paymentStatus === 'rejected' || paymentStatus === 'cancelled') && reservationId) {
        console.log(`Webhook: Payment rejected/cancelled for reservation ${reservationId}`);
        const resRef = doc(db, "reservations", reservationId);
        await updateDoc(resRef, {
          status: "failed",
          failedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error processing Mercado Pago webhook notification:", error);
    }
  }
}
