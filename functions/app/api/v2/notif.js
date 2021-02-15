const db = require('firebase-admin').firestore();

const ccc = require('./constants.js');

module.exports = { onCreateOffer };

function onCreateOffer(offer) {
  db.collection('chats');

  db.collection('chats').add({
    users: [offer.seller_id, offer.buyer_id],
    msgs: [{ senderId: offer.creator_id, content: ccc.MSG_CREATED_OFFER }],
  });
}
