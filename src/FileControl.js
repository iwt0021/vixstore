export default class FileControl {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  saveImage(dataURL, fileName, onSuccess) {
    var self = this;
    window.requestFileSystem(window.TEMPORARY, 20 * 1024 * 1024, function(fs) {
      fs.root.getFile(fileName, {
        create: true,
        exclusive: false
      }, function(fileEntry) {
        // console.log(fileEntry);
        self.writeFile(fileEntry, self.dataURLToBlob(dataURL), fileName, onSuccess);
      }, function() {
        self.openAlert("ファイルの作成に失敗しました");
      });
    }, function() {
      self.openAlert("ファイルシステムを読み込むことができませんでした");
    });
  }

  writeFile(fileEntry, data, fileName, onSuccess) {
    var self = this;
    fileEntry.createWriter(function(fileWriter) {
      fileWriter.onwriteend = function() {
        onSuccess(fileEntry.toURL(), fileName);
      };

      fileWriter.onerror = function(e) {
        self.openAlert("ファイルの書き込みに失敗しました");
      };

      fileWriter.write(data);
    });
  }

  dataURLToBlob(dataURL) {
    var byteString;
    if(dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = unescape(dataURL.split(',')[1]);
    }

    var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    var array = [];
    for(var i = 0; i < byteString.length; i++) {
      array.push(byteString.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type: mimeString });
  }
}
