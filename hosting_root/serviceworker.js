self.addEventListener("push", (e) => {
  console.log("プッシュ通知をサーバーから受け取った", e);
  const data = e.data.json();
  console.table(data);

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      tag: data.tag,
      actions: [
        { action: "actionA", title: "アクションボタンA" },
        { action: "actionB", title: "アクションボタンB" },
      ],
      data: {
        link_to: data.link,
      },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.link_to));
});
