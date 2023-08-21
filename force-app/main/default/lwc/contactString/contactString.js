import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord,updateRecord } from 'lightning/uiRecordApi';

export default class ContactString extends LightningElement {
  @api recordId

  @track record
  @track error

  
  @wire(getRecord, {recordId: '$recordId',fields: ["Contact.Name"]}) // fieldsに値に変数を用いる場合は'$fields'
  handleRecord({ data, error }) {
    if (data) {
      this.record = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.record = undefined;
    }
  }

  
  get value() {
    return this.record.fields.Name.value
  }

  
  async handleUpdate(e) {
  
    // 更新した内容は下記で取得可能
    console.log(e.target.value);

    // Validation (マルチセレクト等とコードを共有することを考慮し、edit-targetが1件でも下記を推奨)
    const allValid = [...this.template.querySelectorAll('.edit-target')]
      // 第１:これまでの結果, 第２:配列の値
      .reduce((validSoFar, inputFields) => {
        inputFields.reportValidity(); // Validation機能を発火させる(WebAPI)
        return validSoFar && inputFields.checkValidity(); // checkValidityで真偽値を判定(WebAPI)
      }, true); // 初期値

    
    if (allValid) {
      // 更新するためのデータを作成
      const fields = {}
      fields['Id'] = this.recordId;
      fields["Name"] = e.target.value;
      const recordInput = {fields};

      // updateRecordで更新処理をしている
      // ShowToastEventはトーストメッセージ用
      try {
        await updateRecord(recordInput)
        this.dispatchEvent(
          new ShowToastEvent({
              title: 'Success',
              message: 'Contact updated',
              variant: 'success'
          })
        );
      } catch(error) {
        console.log(error)
        console.log(error.body)
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
            title: 'Something is wrong',
            message: 'Check your input and try again.',
            variant: 'error'
        })
      );
    }
  }
}

