'use strict';

var firebase = require('firebase-admin');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');
var Promise = require('promise');

var mailTransport = nodemailer.createTransport('smtps://prasad.c82%40gmail.com:kris12hna@smtp.gmail.com');

var serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://spareseat-147111.firebaseio.com'
});

function sendNotificationToUser(uid) {
  // Fetch the user's email.
  var userRef = firebase.database().ref('/users/' + uid);
  userRef.once('value').then(function(snapshot) {
    var email = snapshot.val().email;
    // Send the email to the user.
    if (email) {
      console.log('email', email);
      sendNotificationEmail(email).then(function() {
      });
    }
  }).catch(function(error) {
    console.log('Failed to send notification to user:', error);
  });
}

function sendNotificationEmail(email) {
  var mailOptions = {
    from: '"SpareSeat Notification" <noreply@spareseat.com>',
    to: email,
    subject: 'Driver Notification!',
    text: 'Hooray! You have a passenger for your spare seat.'
  };
  return mailTransport.sendMail(mailOptions).then(function() {
    console.log('Driver notified:' + email);
  });
}

function startListeners() {
  var uid = null;

  firebase.database().ref('/trips').on('child_added', function(postSnapshot) {

    uid = postSnapshot.key;

    postSnapshot.ref.child("/driver").orderByChild('createdAt').startAt(Date.now()).on("child_added", function(itemSnapshot) {
      sendNotificationToUser(uid);
    });

    // postSnapshot.ref.child("/driver").orderByChild('createdAt').startAt(Date.now()).on("child_removed", function(itemSnapshot) {
    //   console.log('driver removed');
    // });

  });
}

// Start the server.
startListeners();
