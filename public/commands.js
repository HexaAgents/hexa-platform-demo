/* global Office */

Office.onReady(function () {
  Office.actions.associate("openHexaDialog", function (event) {
    var item = Office.context.mailbox.item;
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

    function openDialog() {
      localStorage.setItem("hexa-email-data", JSON.stringify(payload));

      var dialogUrl =
        window.location.protocol +
        "//" +
        window.location.host +
        "/taskpane?mode=dialog";

      Office.context.ui.displayDialogAsync(
        dialogUrl,
        { height: 45, width: 30, displayInIframe: true },
        function (result) {
          if (result.status === Office.AsyncResultStatus.Failed) {
            event.completed();
            return;
          }
          var dialog = result.value;
          dialog.addEventHandler(
            Office.EventType.DialogMessageReceived,
            function (msg) {
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
    }

    try {
      if (typeof item.getAttachmentsAsync !== "function") {
        openDialog();
        return;
      }

      item.getAttachmentsAsync(function (result) {
        if (!result.value || result.value.length === 0) {
          openDialog();
          return;
        }

        var files = result.value.filter(function (a) {
          return (
            a.contentType.startsWith("image/") ||
            a.contentType === "application/pdf"
          );
        });

        if (files.length === 0) {
          openDialog();
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
              if (remaining === 0) openDialog();
            });
          } catch (e) {
            payload.attachments.push(att);
            remaining--;
            if (remaining === 0) openDialog();
          }
        });
      });
    } catch (e) {
      openDialog();
    }
  });
});
