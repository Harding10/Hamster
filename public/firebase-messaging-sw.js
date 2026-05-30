importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCyWsDBXKSgOYLfUNCNeFdeIof9PNqDRgs",
  authDomain: "qblog-f4af7.firebaseapp.com",
  projectId: "qblog-f4af7",
  storageBucket: "qblog-f4af7.firebasestorage.app",
  messagingSenderId: "456290043979",
  appId: "1:456290043979:web:f7e733f440c2575ca9a5ce"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    badge: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          client.postMessage({
            type: 'AGENDA_ACTION',
            action: event.action,
            eventId: event.notification.data.eventId
          });
        }
      })
    );
  } else {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          clients.openWindow('/agenda');
        }
      })
    );
  }
});
