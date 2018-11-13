import MapFacesPage, {PHOTO_MAX_W, PHOTO_MAX_H,
    FACE_T_MGN, FACE_B_MGN, FACE_L_MGN, FACE_R_MGN, CNUMS} from './MapFacesPage'
import VisualRecognition from './VisualRecognition';

export default class ResultImage {

  constructor(openAlert) {
    this.openAlert = openAlert;
  }

  draw(photo, facesRes) {
    const RESULT_IMG_MAX_W = 1280,
        RESULT_IMG_MIN_W = 400,
        RESULT_FONT = "28px sans-serif",
        RESULT_LINE_HEIGHT = 32,
        RESULT_TEXT_MAX_MGN_H = 200,
        RESULT_TEXT_MID_MGN_H = 100,
        RESULT_TEXT_MIN_MGN_H = 50,
        RESULT_TEXT_MGN_T = 30,
        RESULT_TEXT_MGN_B = 50,
        RESULT_NUM_W = 40;
    var rw, rh, // 全体サイズ
        pw = photo.width,
        ph = photo.height,
        ratio = 1,
        facesObj = JSON.parse(facesRes),
        faces = facesObj.images[0].faces,
        facesTextList = [],
        rtlh = 0,
        rtmh = RESULT_TEXT_MAX_MGN_H,
        cx = 0,
        cy = 0,
        canvas = $("<canvas />"),
        ctxt = canvas[0].getContext("2d");
    
    // 画像のスケールの計算
    if(pw > RESULT_IMG_MAX_W) {
      pw = RESULT_IMG_MAX_W;
      ph = Math.round(ph * RESULT_IMG_MAX_W / pw);
      ratio *= RESULT_IMG_MAX_W / pw;
    }

    // 文字列全体のサイズの計算
    faces.forEach(function(face) {
      var textList = VisualRecognition.resultFaceToTextList(face);
      rtlh += RESULT_LINE_HEIGHT * textList.length;
      facesTextList.push(textList);
    });

    // 写真の描画
    if(pw > RESULT_IMG_MAX_W) {
      rw = RESULT_IMG_MAX_W
    } else if(pw < RESULT_IMG_MIN_W) {
      rw = RESULT_IMG_MIN_W;
      rtmh = RESULT_TEXT_MIN_MGN_H;
    } else {
      rw = pw;
      rtmh = RESULT_TEXT_MID_MGN_H;
    }
    rh = ph + RESULT_TEXT_MGN_T + RESULT_TEXT_MGN_B + rtlh;
    canvas.attr("width", rw).attr("height", rh);
    ctxt.clearRect(0, 0, rw, rh);
    ctxt.fillStyle = "white";
    ctxt.fillRect(0, 0, rw, rh);
    cx = (rw - pw) >> 1;
    ctxt.drawImage(photo, 0, 0, photo.width, photo.height, cx, 0, pw, ph);

    // 顔の枠の描画
    ctxt.save();
    ctxt.beginPath();
    ctxt.rect(cx, 0, pw, ph);
    ctxt.clip();
    ctxt.font = RESULT_FONT;
    faces.forEach(function(face, fidx) {
      var loc = face.face_location,
          faceLeft = ~~((loc.left - loc.width * FACE_L_MGN) * ratio),
          faceTop = ~~((loc.top - loc.height * FACE_T_MGN) * ratio),
          faceWidth = ~~(loc.width * (1 + FACE_L_MGN + FACE_R_MGN) * ratio),
          faceHeight = ~~(loc.height * (1 + FACE_T_MGN + FACE_B_MGN) * ratio);
      ctxt.strokeStyle = "red";
      ctxt.lineWidth = 2;
      ctxt.shadowBlur = 0;
      ctxt.strokeRect(cx + faceLeft, faceTop, faceWidth, faceHeight);
      ctxt.fillStyle = "white";
      ctxt.shadowColor = "black";
      ctxt.shadowBlur = 3;
      ctxt.textAlign = "center";
      ctxt.fillText(CNUMS.charAt(fidx),
        cx + faceLeft + (faceWidth >> 1), faceTop + faceHeight + 4 + RESULT_LINE_HEIGHT);
    });
    ctxt.restore();

    // 文字列の描画
    cy = ph + RESULT_TEXT_MGN_T + RESULT_LINE_HEIGHT;
    ctxt.save();
    ctxt.fillStyle = "black";
    ctxt.font = RESULT_FONT;
    faces.forEach(function(face, fidx) {
      var textList = facesTextList[fidx];
      cx = rtmh;
      ctxt.fillText((fidx + 1) + ".", cx, cy);
      cx += RESULT_NUM_W;
      textList.forEach(function(text, tidx) {
        ctxt.fillText(text, cx, cy);
        cy += RESULT_LINE_HEIGHT;
      });
    });
    ctxt.restore();

    return canvas.get(0).toDataURL("image/png");
  }

}
