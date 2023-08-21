import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord,updateRecord } from 'lightning/uiRecordApi';

export default class TestChild extends LightningElement {
  @api number // 親から送られる配列データの何番目を使用するか判定するフラグ
  @api info
  @track error; // wireで取得する際のerrorが入る (現状error発生時に詰めているだけ) (処理しなくてもsalesforce側が勝手にerrorのモーダルを出す)
  @track record; // wireで取得したrecordのデータを詰めておく場所 (そのまま詰めていたが、ネストを掘って住めても良さそう)
  recordId; // 親から受け取りconnectedCallbackで初期化
  field; // objectName.fieldの形でconnectedCallbackで初期化
  target; // ダブルクリック時にreadOnlyやclassの切り替え対象を全コンテキストからアクセスするための変数
  

  // textareaを描画しない場合にfalseにする
  eligible = true;

  // select box用 //
  picklist
  options
  dataType

  // フィールの値を取得しrecordに設定する
  @wire(getRecord,{recordId: '$recordId',fields: '$field'})
  handleRecord({ data, error }) {
    if (data) {
      this.record = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.record = undefined;
    }
  }

  connectedCallback() {
    this.info = this.info[this.number]
    this.recordId = this.info.recordId
    this.dataType = this.info.type
    this.field = `${this.info.objectName}.${this.info.field}`

    if (this.dataType === "PICKLIST") {
      this.options = this.info.picklistValues
      this.eligible = false
      this.picklist = true
    }
  }

  // doubleFunctionとcopyFunctionを実行
  renderedCallback() {
    this.doubleFunction();
    this.copyFunction();

    if (this.dataType === "PICKLIST") {
      console.log("完了")
      const options = this.template.querySelectorAll('.select-option');
      options.forEach((option) => {
        if (option.value === this.record.fields[this.info.field].value) {
          option.selected = true;
        }
      })
    }
  }

  get value() {
    return this.record.fields[this.info.field].value;
  }
  

  // 更新処理
  async handleUpdate(e) {
  
    // 更新した内容は下記で取得可能
    console.log(e.target.value);

    // Validation
    const target = this.template.querySelector('.edit-target');
    target.reportValidity(); // Validation機能を発火させる(WebAPI)
    const isValid = target.checkValidity(); // checkValidityで真偽値を判定(WebAPI)
    
    if (isValid) {
      // 更新するためのデータを作成
      const fields = {}
      fields['Id'] = this.recordId;
      fields[this.info.field] = e.target.value;
      const recordInput = {fields};

      // 更新を実行
      try {
        await updateRecord(recordInput)
      } catch(error) {
        this.dispatchEvent(
          new ShowToastEvent({
              title: 'Error updating record',
              message: error.body.message,
              variant: 'error'
          })
        );
      }
    } else {
      this.dispatchEvent(
        new ShowToastEvent({
            title: 'Validationエラー',
            message: '値が不正なデータです。再確認してください',
            variant: 'error'
        })
      );
    }
  }

  // 編集中のfocusが外れたtextareaにreadonly付与とactiveクラスの除去を行う
  handlerOnBlur() {
    this.target.setAttribute("readonly", "true")
    this.target.classList.remove("active")
  }

  // ダブルクリックした際の挙動を追加 (fullfilled Classの付与・削除)
  // renderedCallback
  doubleFunction() {
    const inputs = this.template.querySelectorAll('.record-input');
  
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];

      if (input.value.length > 0) {
        input.classList.add("fullfilled");
        input.parentNode.classList.add("fullfilled")
      } else {
        input.classList.remove("fullfilled");
        input.parentNode.classList.remove("fullfilled")
      }
  
      input.addEventListener('dblclick', () => {
        const length = input.value.length;
        input.setSelectionRange(length, length);
        input.removeAttribute('readonly');
        input.classList.add("active")
        this.target = input;
      });
    }
  }

  // copy機能を実装する
  copyFunction() {
    const icons = this.template.querySelectorAll('.copy-icon');
    for (let i = 0; i < icons.length; i++) {
      const icon = icons[i];
      icon.addEventListener('click', () => {
        const text = icon.nextElementSibling.value;
        navigator.clipboard.writeText(text); 
      });
    }
  }

  // textareaの値が変更されるたびに高さを設定
  adjustArea(e) {
    e.target.style.height = "";
    e.target.style.height = e.target.scrollHeight + "px"
  }
}