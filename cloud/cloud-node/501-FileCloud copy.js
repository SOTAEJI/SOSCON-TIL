const { google } = require("googleapis");

module.exports = function exportFunc(RED) {
  const googleApi = require('./lib/googleApi');
	const oneApi = require('./lib/oneApi');

  function FileCloudNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    this.on("input", async (msg, send, done) => {
      const doType = config.doType;
      const cloudType = config.cloudType;
      const fileName = msg.payload.fileName || config.fileName;
      const filePath = msg.payload.filePath || config.filePath;

      var param = {
        fileName,
        filePath
      };

      if (cloudType === "google") {
        const refreshToken = config.refreshToken;
        const redirectUri = "https://developers.google.com/oauthplayground";
        const auth = new google.auth.OAuth2(
          config.clientId,
          config.clientSecret,
          redirectUri
        );
        auth.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({
          version: "v3",
          auth,
        });
        param['drive'] = drive;
      } else if (cloudType === "one") {
        const apiUrl = "https://graph.microsoft.com/v1.0/me/drive/";
        const accessToken = config.accessToken;
        param['apiUrl'] = apiUrl;
        param['accessToken'] = accessToken;
      }
      
      switch (doType) {
        case "download":
          const func = cloudType == 'google' ? googleApi.download(param) : oneApi.download(param);
          func.then((val) => {
              msg.filePath = `${filePath}/${fileName}`;
              msg.data = val;
            })
            .catch((error) => {
              node.status({ fill: "red", shape: "dot", text: "error" });
              node.error("failed: download" + error.toString(), msg);
            });
          break;
        case "upload":
          const func = cloudType == 'google' ? googleApi.upload(param) : oneApi.upload(param);
          func.then((val) => {
              msg.filePath = `${filePath}/${fileName}`;
              msg.data = val;
              send(msg);
            })
            .catch((error) => {
              node.status({ fill: "red", shape: "dot", text: "error" });
              node.error("failed: upload" + error.toString(), msg);
            });
          break;
        case "read":
          const func = cloudType == 'google' ? googleApi.read(param) : oneApi.read(param);
          func.then((val) => {
              msg.data = val;
              send(msg);
            })
            .catch((error) => {
              node.status({ fill: "red", shape: "dot", text: "error" });
              node.error("failed: read" + error.toString(), msg);
            });
      }
    });
  }

  RED.nodes.registerType("FileCloud", FileCloudNode);
};
