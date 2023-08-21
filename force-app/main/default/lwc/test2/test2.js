import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord,updateRecord } from 'lightning/uiRecordApi';

export default class Test2 extends LightningElement {
  @api recordId
  @track record
  @track error

  // 現在の値を取得
  @wire(getRecord, {recordId: '$recordId',fields: ["Account.SLAExpirationDate__c"]})
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
    
  }

  
  renderedCallback() {
    
  }

  
  get value() {
    return this.record.fields.SLAExpirationDate__c.value
  }

  
  async handleUpdate(e) {
    // Validation
    const allValid = [...this.template.querySelectorAll('edit-target')]
        // 第１:これまでの結果, 第２:配列の値
        .reduce((validSoFar, inputFields) => {
          inputFields.reportValidity();
          return validSoFar && inputFields.checkValidity();
        }, true); // 初期値
    
    if (allValid) {
      // 更新するためのデータを作成
      const fields = {}
      fields['Id'] = this.recordId;
      fields["SLAExpirationDate__c"] = e.target.value;
      const recordInput = {fields};

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