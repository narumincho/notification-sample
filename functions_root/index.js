// @ts-check
"use strict";
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const webpush = require("web-push");

// admin.initializeApp(functions.config().firebase);
admin.initializeApp();

const db = admin.firestore();
const dbRef = db.collection("c").doc("d");
console.log("run index.js");

module.exports = {
    setKey: functions.https.onRequest((request, response) => {
        const vapidKeys = webpush.generateVAPIDKeys();
        dbRef
            .update({
                publicKey: vapidKeys.publicKey,
                privateKey: vapidKeys.privateKey
            })
            .then(() => {
                console.log("サーバーに鍵を用意した", {
                    publicKey: vapidKeys.publicKey,
                    privateKey: vapidKeys.privateKey
                });
                response.send(
                    "サーバーに鍵を用意した /get_public_keyで取得して"
                );
            });
    }),
    getPublicKey: functions.https.onRequest((request, response) => {
        dbRef.get().then(doc => {
            const vapidKeys = doc.data();
            console.log(
                "Firebaseサーバー → ブラウザ:公開キー",
                vapidKeys.publicKey
            );
            console.log(
                "Firebaseサーバー → ブラウザ:秘密キー",
                vapidKeys.privateKey
            );
            response.send(vapidKeys.publicKey);
        });
    }),
    sendNotification: functions.https.onRequest((request, response) => {
        dbRef.get().then(async doc => {
            const vapidKeys = doc.data();
            console.log(
                "Firebaseサーバー → pushサーバー: 公開キー",
                vapidKeys.publicKey
            );
            console.log(
                "Firebaseサーバー → pushサーバー: 秘密キー",
                vapidKeys.privateKey
            );

            await webpush.sendNotification(
                {
                    endpoint: request.body.endpoint,
                    keys: {
                        auth: request.body.auth,
                        p256dh: request.body.p256dh
                    }
                },
                JSON.stringify({
                    title: request.body.title,
                    body: request.body.body,
                    icon: request.body.icon,
                    link: request.body.link
                }),
                {
                    vapidDetails: {
                        subject:
                            "https://notification-sample-655a5.firebaseapp.com/",
                        publicKey: vapidKeys.publicKey,
                        privateKey: vapidKeys.privateKey
                    }
                }
            );

            response.json({
                msg: "データベースに入っていた公開キー",
                publicKey: vapidKeys.publicKey
            });
        });
    })
};
