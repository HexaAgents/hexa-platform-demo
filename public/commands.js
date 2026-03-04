/* global Office */

Office.onReady(function () {
  Office.actions.associate("openHexaDialog", function (event) {
    var item = Office.context.mailbox.item;
    var baseUrl =
      window.location.protocol + "//" + window.location.host;

    var payload = {
      senderName: "",
      senderEmail: "",
      subject: "",
      attachments: [],
    };

    try {
      payload.senderName = item.from.displayName || "";
      payload.senderEmail = item.from.emailAddress || "";
      payload.subject = item.subject || "";
    } catch (e) {
      // Proceed with empty sender/subject
    }

    function showNotification(message, persistent) {
      try {
        item.notificationMessages.replaceAsync("hexa-status", {
          type: Office.MailboxEnums.ItemNotificationMessageType
            .InformationalMessage,
          message: message,
          icon: "Icon16",
          persistent: !!persistent,
        });
      } catch (e) {
        // Notification API unavailable
      }
    }

    function sendToApi() {
      showNotification("Sending to Hexa...", true);

      var senderEmail = payload.senderEmail;
      var body = JSON.stringify({
        senderName: payload.senderName,
        senderEmail: senderEmail,
        emailSubject: payload.subject,
        customer: {
          id: "cust-" + Date.now(),
          name: payload.senderName || "Unknown Sender",
          email: senderEmail || "unknown@example.com",
          phone: "",
          company: senderEmail
            ? senderEmail.split("@")[1].split(".")[0] || "Unknown"
            : "Unknown",
          billingAddress: "Not provided",
          shippingAddress: "Not provided",
        },
        attachments: payload.attachments.map(function (a) {
          var att = {
            id: "att-" + Date.now() + "-" + a.id.slice(-6),
            fileName: a.name,
            mimeType: a.contentType,
            size: a.size,
            url: "/attachment-placeholder",
          };
          if (a.content) att.content = a.content;
          return att;
        }),
      });

      var xhr = new XMLHttpRequest();
      xhr.open("POST", baseUrl + "/api/orders", true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          var order;
          try {
            order = JSON.parse(xhr.responseText);
          } catch (e) {
            // Parse failed
          }

          showNotification("Sent to Hexa!", true);

          if (order && order.id) {
            var dialogUrl =
              baseUrl +
              "/taskpane?mode=result&orderId=" +
              encodeURIComponent(order.id);

            Office.context.ui.displayDialogAsync(
              dialogUrl,
              { height: 25, width: 22, displayInIframe: true },
              function (result) {
                if (result.status === Office.AsyncResultStatus.Failed) {
                  event.completed();
                  return;
                }
                var dialog = result.value;
                dialog.addEventHandler(
                  Office.EventType.DialogMessageReceived,
                  function () {
                    dialog.close();
                    event.completed();
                  }
                );
                dialog.addEventHandler(
                  Office.EventType.DialogEventReceived,
                  function () {
                    event.completed();
                  }
                );
              }
            );
          } else {
            event.completed();
          }
        } else {
          showNotification("Failed to send — please try again.", false);
          event.completed();
        }
      };

      xhr.onerror = function () {
        showNotification("Network error — please try again.", false);
        event.completed();
      };

      xhr.send(body);
    }

    try {
      if (typeof item.getAttachmentsAsync !== "function") {
        sendToApi();
        return;
      }

      item.getAttachmentsAsync(function (result) {
        if (!result.value || result.value.length === 0) {
          sendToApi();
          return;
        }

        var files = result.value.filter(function (a) {
          return (
            a.contentType.startsWith("image/") ||
            a.contentType === "application/pdf"
          );
        });

        if (files.length === 0) {
          sendToApi();
          return;
        }

        var remaining = files.length;
        files.forEach(function (file) {
          var att = {
            id: file.id,
            name: file.name,
            size: file.size,
            contentType: file.contentType,
          };

          try {
            item.getAttachmentContentAsync(file.id, function (contentResult) {
              if (
                contentResult.status === "succeeded" &&
                contentResult.value &&
                contentResult.value.content
              ) {
                att.content = contentResult.value.content;
              }
              payload.attachments.push(att);
              remaining--;
              if (remaining === 0) sendToApi();
            });
          } catch (e) {
            payload.attachments.push(att);
            remaining--;
            if (remaining === 0) sendToApi();
          }
        });
      });
    } catch (e) {
      sendToApi();
    }
  });
});
