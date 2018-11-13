import {visualRecognitionConfig} from './configEx';

export default class VisualRecognition {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  refreshToken(imageUri, onSuccess) {
    // ToDo: 有効期間は毎回取りにいかない
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

  static resultFaceToTextList(face) {
    var textList = [],
        text = 'Age: ';
    if ('max' in face.age && 'min' in face.age) {
      //年齢の上限と下限が認識された場合
      text += face.age.min + ' - ' + face.age.max + ' ( ' + face.age.score + ')';
      textList.push(text);
    } else if ('max' in face.age){
      //年齢の上限のみ認識された場合
      text += face.age.max + ' ( ' + face.age.score + ')';
      textList.push(text);
    } else if ('min' in face.age){
      //年齢の下限のみ認識された場合
      text += face.age.min +  ' ( ' + face.age.score + ')';
      textList.push(text);
    }
    //性別
    text = 'Gender: ' + face.gender.gender + ' ( ' + face.gender.score + ')';
    textList.push(text);

    return textList;
  }

}
