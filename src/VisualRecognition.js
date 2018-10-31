import {visualRecognitionConfig} from './configEx';

export default class VisualRecognition {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  refreshToken(imageUri, onSuccess) {
    // ToDo: 有効期間は毎回取りにいかない
    // ToDo: apikeyはどこかのサーバーに置いてtokenだけユーザーに渡すことが望ましい
    var self = this;
    $.ajax({
      url: "http://www.enc.jp/visualRecog/vrecogToken.php",
      dataType: "json"
    }).done(function(obj) {
      self.tokenObj = obj;
      self.recognizeFacesSub(imageUri, onSuccess);
    }).fail(function(xhr, statusText) {
      self.openAlert("AIサーバーとの通信に失敗しました: " + statusText);
    });
  }

  recognizeFaces(imageUri, onSuccess) {
    this.refreshToken(imageUri, onSuccess);
  }

  recognizeFacesSub(imageUri, onSuccess) {
    var self = this,
      options = new FileUploadOptions();
    options.filekey = 'images_file';
    options.fileName = imageUri.substr(imageUri.lastIndexOf('/') + 1);
    options.headers = { "Authorization" : "Bearer " + this.tokenObj.access_token };
    var fileTransfer = new FileTransfer();
    fileTransfer.upload(imageUri, visualRecognitionConfig.url, onSuccess, function(error) {
      self.openAlert("AIサーバーとの通信に失敗しました: " + error.code
        + "," + error.source + "," + error.target);
    }, options);
  }

}