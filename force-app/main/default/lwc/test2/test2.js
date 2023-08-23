import { LightningElement, wire, track, api } from 'lwc';
import userId from '@salesforce/user/Id';
import { getRecord } from 'lightning/uiRecordApi';
import test2Page from './test2.html';
import nullPage from './null.html';

export default class Test2 extends LightningElement {
  userId = userId
  @api role

  @track record
  @track error

  @wire(getRecord, { 'recordId': userId, fields: "User.UserRole.Name" })
  handleRecord({ data, error }) {
    if (data) {
      console.log(data)
      this.record = data;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.record = undefined;
    }
  }

  render() {
    if (!this.record || !this.record.fields) {
      return nullPage;
    }
    if (this.record.fields.UserRole.displayValue === this.role || this.role === 'free') {
      return test2Page;
    }
    return nullPage;
  }
}