export default class ImageResize {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  resize(imageUri, maxWidth, maxHeight, onSuccess) {
    var image = new Image();
    image.onload = function() {
      var width = image.width,
          height = image.height;
      if(width > maxWidth) {
        var ratio = maxWidth / width;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      if(height > maxHeight) {
        var ratio = maxHeight / height;
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      var canvas = $("<canvas />")
            .attr("width", width)
            .attr("height", height),
          ctxt = canvas[0].getContext("2d");
      ctxt.clearRect(0, 0, width, height);
      ctxt.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);

      var dataURL = canvas.get(0).toDataURL("image/jpeg");
      onSuccess(dataURL, image.width, image.height);
    }
    image.src = imageUri;
  }

}
