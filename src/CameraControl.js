export default class CameraControl {

  constructor(srcType, onSuccess, onFailed) {
    this.srcType = srcType;
    this.onSuccess = onSuccess;
    this.onFailed = onFailed;
  }

  setCameraOptions(srcType) {
    var options = {
      // Some common settings are 20, 50, and 100
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI,
      // In this app, dynamically set the picture source, Camera or photo gallery
      sourceType: srcType,
      encodingType: Camera.EncodingType.JPEG,
      mediaType: Camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true  //Corrects Android orientation quirks
    }

    return options;
  }

  openCamera() {
    var options = this.setCameraOptions(this.srcType);
    navigator.camera.getPicture(this.onSuccess, this.onFailed, options);
  }

}
