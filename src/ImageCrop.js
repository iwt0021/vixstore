export default class ImageCrop {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  crop(imageUri, x, y, w, h, onSuccess) {
    var image = new Image();
    image.onload = function() {
      var canvas = $("<canvas />")
            .attr("width", w)
            .attr("height", h),
          ctxt = canvas[0].getContext("2d");
      ctxt.clearRect(0, 0, w, h);
      ctxt.drawImage(image, x, y, w, h, 0, 0, w, h);

      var dataURL = canvas.get(0).toDataURL("image/jpeg");
      onSuccess(dataURL);
    }
    image.src = imageUri;
  }

}
