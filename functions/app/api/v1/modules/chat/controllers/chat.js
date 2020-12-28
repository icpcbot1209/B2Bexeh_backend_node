var bookshelf = __rootRequire('app/config/bookshelf');
var config = __rootRequire('app/config/constant');
var chatModels = require('../models/chat_models');
var roomModels = require('../../bidsAsks/models/room_models');
var contactModels = require('../../bidsAsks/models/contact_models');
var Response = require('../../../../../utils/response');
var constant = require('../../../../../utils/constants');
var common_query = require('../../../../../utils/commonQuery');
var roomModel = require('../../bidsAsks/models/room_models');
var contactModel = require('../../bidsAsks/models/contact_models');
var moment = require('moment');





exports.chatConfig = function (io) {
  try {
    var chat = io.on('connect', async function (socket) {
      console.log("SOCKET CONNECTED****************************");

      socket.on('create-room', async (data) => {
        console.log('datata________((((((((((((((((((((((((((((', data)
        if (data.room_id) {
          console.log('room_id data')

          socket.room = data.room_id
          console.log('soclet 26', socket.room)
        }
        if (data.room) {
          socket.room = data.room
          console.log('soclet 30', socket.room)
        }

        if (data.room.userid_of_my_contact && data.room.my_id) {
          let dataROOm = {
            user_id1: data.room.my_id,
            user_id2: data.room.userid_of_my_contact,
            status: true,
            created_at: `${moment().utc().format('YYYY-MM-DD')}`,
            updated_at: `${moment().utc().format('YYYY-MM-DD')}`
          };


          // const room_user = await common_query.findAllData(roomModel, rm_condition).catch(err => {
          //   throw err
          // })
          let inRoom = await bookshelf.knex.raw(`select 
           "id" from rooms where ("user_id1"= '${data.room.my_id}' and "user_id2"= 
           '${data.room.userid_of_my_contact}') or
           ("user_id2"= '${data.room.my_id}' and "user_id1"= '${data.room.userid_of_my_contact}');`);
          // console.log('offer_idoffer_id', req.body.offer_id)
          if (inRoom.rowCount) {
            console.log('2')
            let rmCondition = {
              id: inRoom.rows[0].id
            }

            console.log('5')

            const update_rm = {
              status: true,
              updated_at: `${moment().utc().format('YYYY-MM-DD')}`
            }
            await common_query.updateRecord(roomModel, update_rm, rmCondition).catch(err => {
              throw err
            })

            const contact_chat_condition = {
              room_id: inRoom.rows[0].id,
              my_id: data.room.my_id,
              my_contact_id: data.room.userid_of_my_contact

            }
            socket.room = inRoom.rows[0].id
            socket.join(socket.room)
            io.emit('receive', {
              data: '',
              roomCreated: true,
              room_id: inRoom.rows[0].id,
              my_id: data.room.my_id
            }, console.log('room_id emitted'));
            console.log('data contact_chat_condition id in line number 312', contact_chat_condition)

            let contactInfo = await common_query.findAllData(contactModel,
              contact_chat_condition).catch(err => {
                throw err
              })
            console.log('data contact id in line number 317', contactInfo.data.toJSON())

            if ((contactInfo.data.toJSON()).length) {
              contactInfo = contactInfo.data.toJSON()
              // contact_id_for_chat = contactInfo[0].id;
              // console.log('data contact id in line number 318', contact_id_for_chat)
            } else {
              let data = {
                my_id: data.room.my_id,
                my_contact_id: data.room.userid_of_my_contact,
                isblocked: false,
                created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                room_id: inRoom.rows[0].id,
              };
              await common_query.saveRecord(contactModel, data).catch(err => {
                throw err
              })
            }


          } else {
            console.log('datadatadatadata', dataROOm);
            let saveRoom = await common_query.saveRecord(roomModel, dataROOm).catch(err => {
              throw err
            });
            console.log('saveRoomsaveRoom', saveRoom.success.toJSON());
            let resp = saveRoom.success.toJSON()
            socket.room = resp.id
            io.emit('receive', {
              data: '',
              roomCreated: true,
              room_id: resp.id,
              my_id: data.room.my_id
            }, console.log('RECICEEEEEEEEEE'));
            socket.join(socket.room)
            if (saveRoom) {
              let dataCon = {
                my_id: data.room.my_id,
                my_contact_id: data.room.userid_of_my_contact,
                isblocked: false,
                created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                room_id: resp.id
              };
              let c2 = await common_query.saveRecord(contactModel, dataCon).catch(err => {
                throw err
              })
              let data1 = {
                my_contact_id: data.room.my_id,
                my_id: data.room.userid_of_my_contact,
                isblocked: false,
                created_at: `${moment().utc().format('YYYY-MM-DD')}`,
                updated_at: `${moment().utc().format('YYYY-MM-DD')}`,
                room_id: resp.id
              };
              let c1 = await common_query.saveRecord(contactModel, data1).catch(err => {
                throw err
              });


            }
          }

        }
        // chat.in(data).emit('startChat', {
        //     boolean: true,
        //     id: data,

        // });
        socket.join(socket.room)
        //   io.in(socket.room).clients((err, clients) => {
        //     console.log('clients connected', clients); // an array containing socket ids in 'room3'
        // });

      })

      socket.on('send-pending', async (data) => {
        console.log('end-pending', data)
        if(data.action){
          if(data.action=='createOffer'
          ){

          io.emit('recievePendingInOfferSection', {
            data: data,
            user_id:data.createdForId,

            action:'createOffer'
          });
          }
        }else{

          console.log('send-pending%%%%%%%%%%%%%%%%%%%%')

          io.emit('recievePendingInOfferSection', {
            data: data,
            user_id:data.createdForId,
            action:'notCreateOffer'
          });
        }
        // const roomid = await bookshelf.knex.raw(`select 
        // "id" from rooms where ("user_id1"= '${data.createdForId}' and "user_id2"= 
        // '${data.createdbyId}') or
        // ("user_id2"= '${data.createdForId}' and "user_id1"= '${data.createdbyId}');`);
        // console.log('send-pending')

        // if (roomid.rowCount) {
        //   console.log('inRoom.rows[0].id', roomid.rows[0].id)
        //   socket.room = roomid.rows[0].id
        //   socket.join(socket.room);
        //   console.log('ensocket.roomd-pending', socket.room)
        
          // socket.broadcast.to(socket.room).emit('recievePendingInOfferSection', {
          //   data: 'callpending',
          //   user_id: data.createdForId
          // });
        
        // }
      })
      socket.on('sendmsg', async (data) => {
        console.log('data sendmsg', data)
        console.log('data sendmsg socket.room', socket.room)
        console.log('data sendmsg data._room_id', data.room_id)

        // io.in(socket.room).emit('receive', { message: data.msg });
        if (data.room_id) {
          if (data.type == 'table' || data.type == 'text' || data.type == 'email') {
            let rCondition = {
              my_id: data.my_id,
              room_id: data.room_id

            }
            // save the msg in db
            console.log("rConditionrCondition", rCondition);

            const contact_id = await common_query.findAllData(contactModels, rCondition)

            let userId2 = contact_id.data.toJSON()
            console.log("contact_idcontact_idcontact_id 1111111111111111",
              userId2, 'userId2[0].my_contact_id');

            const chatData = {
              my_id: parseInt(data.my_id),
              room_id: parseInt(data.room_id),
              contact_id: parseInt(userId2[0].my_contact_id),
              message: data.msg,
              type: data.type,
              date_to_group: `${moment().utc().format('YYYY-MM-DD')}`,
              created_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              isdelete: false,
              isActionPerformedbySender: false,
              isActionPerformedbyRecieved: false,
              isofferAccepted: false,
              isofferCanceled: false,
              isofferExpired: false,
              isofferCanceled: false
            }
            let chatD = await common_query.saveRecord(chatModels, chatData)
            socket.room = data.room_id
            console.log('chatDchatDchatDchatD', socket.room);

            socket.broadcast.to(socket.room).emit('receive', {
              data: data.msg,
              userid_of_my_contact: data.my_id, type: data.type, room_id: data.room_id
            });
            // socket.broadcast.in(socket.room).emit('receive', { data: data.msg });
            // socket.to(socket.room).emit('receive', { data: data.msg });
          } else if (data.type == 'action') {
            socket.room = data.room_id
            socket.broadcast.to(socket.room).emit('receive', {
              data: data.msg,
              userid_of_my_contact: data.my_id, type: data.type, room_id: data.room_id
            });
          }

        } else {
          let rCondition = {
            my_id: data.my_id,
            my_contact_id: data.my_contact_id

          }
          // save the msg in db
          console.log("rConditionrCondition", rCondition);

          const rum_id = await common_query.findAllData(contactModels, rCondition)

          let userId2 = rum_id.data.toJSON()
          console.log('contact_idcontact_idcontact_id',
            userId2, 'userId2[0].my_contact_id');
          if (data.type == 'table' || data.type == 'text' || data.type == 'email') {
            const chatData = {
              my_id: parseInt(data.my_id),
              room_id: parseInt(userId2[0].room_id),
              contact_id: data.my_contact_id,
              message: data.msg,
              type: data.type,
              date_to_group: `${moment().utc().format('YYYY-MM-DD')}`,
              created_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              updated_at: `${moment().utc().format('YYYY-MM-DD HH:mm:ss')}`,
              isdelete: false,
              isActionPerformedbySender: false,
              isActionPerformedbyRecieved: false,
              isofferAccepted: false,
              isofferCanceled: false,
              isofferExpired: false
            }
            let chatD = await common_query.saveRecord(chatModels, chatData)
            // console.log('chatDchatDchatDchatD',chatD);
            socket.room = userId2[0].room_id
            // console.log('socket.room',socket.room);

            socket.broadcast.to(socket.room).emit('receive', {
              data: data.msg,
              userid_of_my_contact: data.my_id, type: data.type, room_id: userId2[0].room_id
            });
            // socket.broadcast.in(socket.room).emit('receive', { data: data.msg });
            // socket.to(socket.room).emit('receive', { data: data.msg });
          } else if (data.type == 'action') {
            socket.room = userId2[0].room_id
            // console.log('socket.room',socket.room);

            socket.broadcast.to(socket.room).emit('receive', {
              data: data.msg,
              userid_of_my_contact: data.my_id, type: data.type, room_id: userId2[0].room_id
            });
          }

        }

      })



      // io.in()

      io.in('Unique_Room_123').clients((err, clients) => {
        console.log('clients connected', clients); // an array containing socket ids in 'room3'
      });


    })

    // var socketRoom;
    // var chat = io.on('connect', function(socket) {
    //     console.log('inside sockrt connect')
    //   socket.on("new-message", data => {
    //     console.log("sendMsg created", data);
    //     io.emit("recieve", {
    //       user: data.user,
    //       message: data.message
    //     });
    //   });
    //   socket.on("typing", data => {
    //     if (data.typing == true) {
    //       socket.broadcast.in(data.room).emit("display", data);
    //     } else {
    //       io.emit("display", data);
    //     }
    //   });
    //   socket.on("join", function(data) {
    //     socket.join(data.room);
    //     console.log(data.user + "Joined the room" + data.room);
    //     socket.broadcast.to(data.room).emit("user joined", {
    //       user: data.user,
    //       message: "has joined this room"
    //     });
    //   });
    //   socket.on("leave", function(data) {
    //     console.log(data.user + "left the room" + data.room);
    //     socket.broadcast.to(data.room).emit("user left", {
    //       user: data.user,
    //       message: "has left this room"
    //     });
    //     socket.leave(data.room);
    //   });
    // });
  } catch (error) {
    console.log("error on chat", error);
  }
};