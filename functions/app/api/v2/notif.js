const bookshelf = require('app/config/bookshelf');
const admin = require('app/config/my-firebase');
const db = admin.firestore();

const ACTION_TYPES = {
  offer_created: 'offer_created',
  offer_accepted: 'offer_accepted',
  offer_declined: 'offer_declined',
  offer_terms_changed: 'offer_terms_changed',
  offer_paid: 'offer_paid',
  offer_shipped: 'offer_shipped',
};
module.exports.ACTION_TYPES = ACTION_TYPES;

// These registration tokens come from the client FCM SDKs.
const registrationTokens = [
  'dEWppe-aqabgQdkzXerDvQ:APA91bE4mdImE_AfPArU5O6V9xejUbPsr7tNR-X9EDTnt5VuwnigIkT0RmSOhclKDThUEd9uw7PtQ7o-apB1_sw79MAbscYQ1QRSfhj4SzPH8vaJHGdTx3xa98Xzzk0r4eCzKZynfIPE',
];

module.exports.sendMsg = function (message = null) {
  if (!message) {
    message = {
      notification: { title: 'Hey there', body: 'Thank you' },
      data: { score: '100', date: '1992-11-04' },
      tokens: registrationTokens,
    };
  }

  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }
    });
};

async function getUserByUid(user_uid) {
  let rows = await bookshelf.knex('users').where({ user_uid: user_uid }).select('*');
  if (rows.length == 0) return null;
  return rows[0];
}

module.exports.notifyOnOffer = async function (action_type, user_uid, offer) {
  let txt = '';
  let sender = await getUserByUid(user_uid);
  let receiver_id = offer.seller_id === sender.id ? offer.buyer_id : offer.seller_id;
  let is_sender_creator = offer.creator_id === sender.id;

  if (action_type === ACTION_TYPES.offer_created) {
    txt = `${sender.user_name} sent offer ${offer.id}`;
  }
  if (action_type === ACTION_TYPES.offer_accepted) {
    txt = `${sender.user_name} accepted offer ${offer.id}`;
  }
  if (action_type === ACTION_TYPES.offer_declined) {
    txt = `${sender.user_name} declined offer ${offer.id}`;
  }
  if (action_type === ACTION_TYPES.offer_paid) {
    txt = `${sender.user_name} paid products on offer ${offer.id}`;
  }
  if (action_type === ACTION_TYPES.offer_shipped) {
    txt = `${sender.user_name} shipped products on offer ${offer.id}`;
  }
  if (action_type === ACTION_TYPES.offer_terms_changed) {
    txt = `${sender.user_name} changed terms of offer ${offer.id}`;
  }

  let newNotif = {
    action_type: action_type,
    action_text: txt,
    action_payload: {
      sender_id: sender.id,
      sender_name: sender ? sender.user_name : '???',
      sender_photo: sender ? sender.photo_url : '',
      is_sender_creator,
      offer_id: offer.id,
    },
    timestamp: Date.now(),
    is_read: false,
  };

  await db.collection('notifs').doc(receiver_id).collection('notifs').add(newNotif);
};
