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
        width = maxWidth;
        height = Math.round(height * maxWidth / width);
      }
      if(height > maxHeight) {
        width = Math.round(width * maxHeight / height);
        height = maxHeight;
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
