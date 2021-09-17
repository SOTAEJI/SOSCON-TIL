const { google } = require("googleapis");
const fs = require("fs");

const mimeType = {
  pdf: "application/pdf",
  text: "text/plain",
  msWord:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  msExcel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  msPpt:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv",
  json: "application/vnd.google-apps.script+json",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
};

module.exports = function exportFunc(RED) {
  function GoogleDriveListNode(config) {
    RED.nodes.createNode(this, config);
    const redirectUri = "https://developers.google.com/oauthplayground";
    this.on("input", async (msg, send, done) => {
      const clientId = config.clientId;
      const clientSecret = config.clientSecret;
      const refreshToken = config.refreshToken;
      const fileName = config.fileName;
      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      auth.setCredentials({ refresh_token: refreshToken });
      const drive = google.drive({
        version: "v3",
        auth,
      });
      var pageToken = null;
      const params = {
        q: `name='${fileName}'`,
        fields: "files(id, name)",
        spaces: "drive",
      };
      const response = drive.files
        .list(params)
        .then((res) => {
          console.log(res.data.files[0]["id"]);
          msg.fileId = res.data.files[0];
        })
        .then(() => {
          this.send(msg);
        })
        .catch((err) => {
          msg.payload = err;
          this.send(msg);
        });
    });
  }
  RED.nodes.registerType("Google Drive File List", GoogleDriveListNode);
};
