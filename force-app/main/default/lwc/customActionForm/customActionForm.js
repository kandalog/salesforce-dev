import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord,updateRecord } from 'lightning/uiRecordApi';

export default class CustomActionForm extends LightningElement {
  recordId;
  @api number 
  @api info
  field; 
  options

  @track record; 
  @track error; 
  
  dataType;
  isString;
  isDate;
  isPicklist;
  isBoolean;
  isMultiPicklist;
  
  
  
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
    this.field = `${this.info.objectName}.${this.info.field}`
    // PICLISTやMULTIPICLISTで使用するoptionを全体で入れておく
    this.options = this.info.picklistValues
    // 下記は不要かも
    this.dataType = this.info.type

    const dataType = ["PICKLIST", "MULTIPICKLIST", "BOOLEAN", "DATE"]
    if (!dataType.includes(this.info.type)) {
      this.isString = true
    }
    if (this.info.type === "DATE") {
      this.isDate = true;
    }
    if (this.info.type === "PICKLIST") {
      this.isPicklist = true;
    }
    if (this.info.type === "BOOLEAN") {
      this.isBoolean = true;
    }
    if (this.info.type === "MULTIPICKLIST") {
      this.isMultiPicklist = true;
    }
    
  }

  renderedCallback() {
    // ダブルクリック機能を有効化
    this.doubleFunction();
    // コピー機能を有効化
    this.copyFunction();

    
    if (this.isPicklist) {
      const options = this.template.querySelectorAll('.select-option');
      options.forEach((option) => {
        if (option.value === this.record.fields[this.info.field].value) {
          option.selected = true;
        }
      })
    }

    if(this.isMultiPicklist){

      // マルチセレクトのモーダル機能を実装
      const multiCheckboxToggleButton = this.template.querySelector('.multi-checkbox-toggle-button')
      multiCheckboxToggleButton.addEventListener('click',(e) => {
        e.target.nextElementSibling.classList.toggle('active')
      })

      // 選択済みのoptionをcheckedにする + 選択済み項目をボタンに挿入
      let currentSelected = "";
      const options = this.template.querySelectorAll('.multi-checkbox');
      options.forEach((option) => {
        if (this.record.fields[this.info.field].value.includes(option.value)) {
          option.checked = true;
          currentSelected += `${option.value} `
        }
      })

      if (currentSelected) {
        multiCheckboxToggleButton.textContent = currentSelected;
      }
    }

  }

  get value() {
    return this.record.fields[this.info.field].value;
  }
  

  
  async handleUpdate(e) {
    // ダブルクリック機能を再度有効化 (外れたclassの付与や属性の付与)
    console.log(e.target)
    this.handlerOnBlur(e)


    // Validation
    // Validation (マルチセレクト等とコードを共有することを考慮し、edit-targetが1件でも下記を推奨)
    // 実はrequiredが付いてないので、このValidationは常にtrueになる
    // 更にrequiredが付いていても、readonlyが存在する場合無視されるために常にtrueになる (今後のために残しておくが消しても良いかも？)
    const allValid = [...this.template.querySelectorAll('.edit-target')]
      // 第１:これまでの結果, 第２:配列の値
      .reduce((validSoFar, inputFields) => {
        inputFields.reportValidity(); // Validation機能を発火させる(WebAPI)
        return validSoFar && inputFields.checkValidity(); // checkValidityで真偽値を判定(WebAPI)
      }, true); // 初期値


      let checkboxesVal = ""
      if(this.isMultiPicklist) {
        const checkboxes = this.template.querySelectorAll('.multi-checkbox');
        // チェックされている場合文字列に追加する
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked === true) {
            checkboxesVal += checkbox.value + ";"
          }
        });
      }
    
    
    if (allValid) {  
      const fields = {}
      fields['Id'] = this.recordId;
      fields[this.info.field] = e.target.value;

      if (this.isBoolean) {
        fields[this.info.field] = e.target.checked;
      }

      if (this.isMultiPicklist) {
        fields[this.info.field] = checkboxesVal;
      }
      
      const recordInput = {fields};
      
      try {
        await updateRecord(recordInput)
      } catch(error) {
        console.log(error)
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








  /////////////////////////////////////// 更新以外の機能 /////////////////////////////////////////////////////////////
  /////////////////////////////////////// ダブルクリック, copy機能の実装 //////////////////////////////////////////////////////

  // ダブルクリック時に外れた属性やclassを元に戻す処理
  handlerOnBlur(e) {
    e.target.setAttribute("readonly", "true")
    e.target.classList.remove("active")
  }

  // ダブルクリック機能とfullfilledクラスの初期化を行う (レンダリング後に呼び出す)
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
      });
    }
  }
  

  // コピー機能を有効化する関数 (レンダリング後のライフサイクルで呼び出す)
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
  
  // textareaのheight制御
  adjustArea(e) {
    e.target.style.height = "";
    e.target.style.height = e.target.scrollHeight + "px"
  }
}