import React from 'react';
import ReactDOM from 'react-dom';
import {Toolbar, Page, Button, BackButton, AlertDialog, Modal, List, ListItem} from 'react-onsenui';

import {dateToTime14} from './commonLib';
import ImageCrop from './ImageCrop'
import VisualRecognition from './VisualRecognition';
import ResultImage from './ResultImage'
import FileControl from './FileControl'

require('./faces.css');

export default class MapFacesPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isSelectContact: false,
      selectFaceIdx: -1
   };
  }

  componentDidMount() {
    updateFaces();
  }

  openAlert(message) {
    this.setState({
      isAlertOpen: true,
      alertMessage: message
    });
  }

  closeAlert() {
    this.setState({
      isAlertOpen: false
    });
  }

  openSelectContact(idx, e) {
    e.preventDefault();

    this.setState({
      selectFaceIdx: idx
    });

    // ToDo: https://docs.monaca.io/ja/reference/cordova_6.2/contacts/#android-%E7%89%B9%E6%9C%89%E3%81%AE%E5%8B%95%E4%BD%9C
    navigator.contacts.pickContact(this.onSelectContactSuccess.bind(this),
      this.onSelectContactFailed.bind(this));
  }

  onSelectContactSuccess(contact) {
    this.setState({
      contact: contact,
      isContactConfirm: true
    });
  }

  onSelectContactFailed(error) {
    this.openAlert("連絡先の取得に失敗しました: " + error);
  }

  closeContactConfirm() {
    this.setState({
      isContactConfirm: false
    });
  }

  saveContactPhoto() {
    this.setState({
      isContactConfirm: false
    });
    var facesObj = JSON.parse(this.props.facesRes),
        faces = facesObj.images[0].faces,
        face = faces[this.state.selectFaceIdx],
        loc = face.face_location;

    var imageCrop = new ImageCrop(this.openAlert.bind(this));
    imageCrop.crop(this.props.imageUri,
      ~~(loc.left - loc.width * FACE_L_MGN),
      ~~(loc.top - loc.height * FACE_T_MGN),
      ~~(loc.width * (1 + FACE_L_MGN + FACE_R_MGN)),
      ~~(loc.height * (1 + FACE_T_MGN + FACE_B_MGN)),
      this.onSuccessCropPhoto.bind(this, this.state.contact));
  }

  onSuccessCropPhoto(contact, imageUri) {
    contact.photos = [ new ContactField("url", imageUri, false) ];
    contact.save(this.onSaveContactPhotoSuccess.bind(this),
      this.onSaveContactPhotoFailed.bind(this));
  }

  onSaveContactPhotoSuccess(contact) {
    console.log("onSaveContactPhotoSuccess");
    console.log(this);
    this.openAlert((contact.displayName ? contact.displayName : contact.name.formatted) + "さんの連絡先の写真を変更しました");
  }

  onSaveContactPhotoFailed(error) {
    this.openAlert("連絡先の保存に失敗しました: " + error.code);
  }

  onSaveResultSuccess(fileURL, fileName) {
    // this.openAlert("認識結果を保存しました");
    console.log(fileURL);
    // cordova.InAppBrowser.open(fileURL, "_system");
    // cordova.InAppBrowser.open(fileURL, "_blank", "location=no");
    cordova.InAppBrowser.open(fileURL, "_blank");
  }

  handleSaveResult(e) {
    e.preventDefault();
  
    var resultImage = new ResultImage(this.openAlert.bind(this)),
        dataURL = resultImage.draw($("#photoImg")[0], $("#facesRes").val()),
        fileControl = new FileControl(this.openAlert.bind(this)),
        fileName = "face" + dateToTime14(new Date()) + ".png";
    // cordova.InAppBrowser.open(dataURL, "_blank");
    // cordova.InAppBrowser.open(dataURL, "_system");
    // fileControl.saveImage(dataURL, fileName, this.onSaveResultSuccess.bind(this));
  }

  renderToolbar() {
    return (
      <Toolbar>
        <div className="left"><BackButton>戻る</BackButton></div>
        <div className="center">顔の選択</div>
      </Toolbar>
    );
  }

  render() {
    var winWidth = $(window).width(),
        facesObj = JSON.parse(this.props.facesRes),
        faces = facesObj.images[0].faces,
        faceInfos = faces.map((face) => <li>{
            VisualRecognition.resultFaceToTextList(face).map((text) => <p>{text}</p>)
          }</li>),
        faceAreas = faces.map((face, idx) => <li id={'faceArea' + (idx + 1) + 'Li'} className="faceAreaLi" onClick={this.openSelectContact.bind(this, idx)}><span className="faceLabelSpan">{CNUMS.charAt(idx)}</span></li>);

    return (
      <Page renderToolbar={this.renderToolbar}>
        <p style={{textAlign: 'center'}}>
          <div id="photoDiv">
            { faces.length > 0 && <ul id="faceAreasUl">{faceAreas}</ul> }
            <img id="photoImg" src={this.props.imageUri} style={{maxWidth: winWidth + 'px'}} />
          </div>
        </p>
        { faces.length == 0 &&
          <p style={{color: 'red', textAlign: 'center'}}>
            認識されませんでした。
          </p>
        }
        { faces.length > 0 &&
          <p style={{color: 'red', textAlign: 'center'}}>
            顔をタッチすると連絡先写真を変更できます。
          </p>
        }
        {/* faces.length > 0 &&
          <p style={{color: 'red', textAlign: 'center'}}>
            <Button onClick={this.handleSaveResult.bind(this)}>認識結果を保存</Button>
          </p>
        */}
        { faces.length > 0 && <ol>{faceInfos}</ol> }
        { faces.length > 0 && this.state.selectFaceIdx >= 0 &&
          <p style={{color: 'red', textAlign: 'center'}}>
            認識された顔を選択してください。
          </p>
        }

        <input id="facesRes" type="hidden" ref="facesRes" defaultValue={this.props.facesRes} />
        <input id="imageOrgWidth" type="hidden" ref="facesRes" defaultValue={this.props.imageOrgWidth} />
        <input id="imageOrgHeight" type="hidden" ref="facesRes" defaultValue={this.props.imageOrgHeight} />

        <AlertDialog isOpen={this.state.isAlertOpen} cancelable>
          <div className="alert-dialog-content">
            {this.state.alertMessage}
          </div>
          <div className="alert-dialog-footer">
            <Button onClick={this.closeAlert.bind(this)} className="alert-dialog-button">
              Ok
            </Button>
          </div>
        </AlertDialog>
        <AlertDialog isOpen={this.state.isContactConfirm} cancelable>
          <div className="alert-dialog-content">
            {this.state.contact ? (this.state.contact.displayName ? this.state.contact.displayName : this.state.contact.name.formatted) : ""} さんの顔写真を{CNUMS.charAt(this.state.selectFaceIdx)}に設定します。よろしいですか？
          </div>
          <div className="alert-dialog-footer">
            <Button onClick={this.saveContactPhoto.bind(this)} className="alert-dialog-button">
              Ok
            </Button>
            <Button onClick={this.closeContactConfirm.bind(this)} className="alert-dialog-button">
              キャンセル
            </Button>
          </div>
        </AlertDialog>
      </Page>
    );
  }

}

export const PHOTO_MAX_W = 1600,
            PHOTO_MAX_H = 1600,
            FACE_T_MGN = 0.4,
            FACE_B_MGN = 0.4,
            FACE_L_MGN = 0.4,
            FACE_R_MGN = 0.4,
            CNUMS = "❶❷❸❹❺❻❼❽❾❿⓫⓬⓭⓮⓯⓰⓱⓲⓳⓴";

function updateFaces() {
  var winWidth = $(window).width(),
      imgWidth = $("#imageOrgWidth").val(),
      ratio = 1,
      facesRes = $("#facesRes").val(),
      facesObj = JSON.parse(facesRes),
      faces = facesObj.images[0].faces;

  if(PHOTO_MAX_W > imgWidth) {
    if(winWidth > imgWidth) {
      ratio = 1;
    } else {
      ratio = winWidth / imgWidth;
    }
  } else {
    if(winWidth > PHOTO_MAX_W) {
      ratio = 1;
    } else {
      ratio = winWidth / PHOTO_MAX_W;
    }
  }

  faces.forEach(function(face, idx) {
    var $faceAreaLi = $("#faceArea" + (idx + 1) + "Li"),
        $faceAreaLabel = $($faceAreaLi.children()[0]),
        loc = face.face_location;
    $faceAreaLi.css("left", ~~((loc.left - loc.width * FACE_L_MGN) * ratio) + "px");
    $faceAreaLi.css("top", ~~((loc.top - loc.height * FACE_T_MGN) * ratio) + "px");
    $faceAreaLi.css("width", ~~(loc.width * (1 + FACE_L_MGN + FACE_R_MGN) * ratio) + "px");
    $faceAreaLi.css("height", ~~(loc.height * (1 + FACE_T_MGN + FACE_B_MGN) * ratio) + "px");
    $faceAreaLabel.css("top", $faceAreaLi.height() + "px");
    $faceAreaLi.show();
  })
}
