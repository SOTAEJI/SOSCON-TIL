const oneDriveAPI=require("onedrive-api").items
const fs=require("fs")

module.exports=RED=>{
    function OneDriveNode(config){
        RED.nodes.createNode(this, config)
        
        this.on("input", msg=>{
            const accessToken = config.accessToken;
            const doType = config.doType;
            const fileId = msg.payload.fileId || config.fileId;
            const fileName = msg.payload.fileName || config.fileName;
            const filePath = msg.payload.filePath || config.filePath;
            const dataType = msg.payload.dataType || config.dataType;

            try {
                switch (doType) {
                    case "download":
                        var params={
                            accessToken: accessToken,
                            itemId: fileId,
                        }
                        const item=oneDriveAPI.download(params)
                        const writeStream=fs.createWriteStream(`${filePath}/${fileName}`)

                        item.pipe(writeStream)
                        item.on("end", ()=>{
                            msg.filePath = `${filePath}/${fileName}`
                        })
                        item.on("error", err=>{
                            throw err
                        })
                        break;
                    case "upload": 
                        var params={
                            accessToken: accessToken,
                            filename: fileName,
                            binary: fs.createReadStream(`${filePath}/${fileName}`, 'binary'),
                        }
            
                        oneDriveAPI.uploadSimple(params).then(()=>{
                            msg.filePath = `${filePath}/${fileName}`
                        }).catch(err=>{
                            throw err
                        })
                }
            } catch (error) {
                msg.payload = error;
            } finally {
                this.send(msg)
            }
        })
    }
    RED.nodes.registerType("OneDrive", OneDriveNode)
}
