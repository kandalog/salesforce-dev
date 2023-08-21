import { LightningElement, api } from 'lwc';

import getFieldMetaData from '@salesforce/apex/ProvideMetaData.getFieldMetaData';


export default class TestParent extends LightningElement {
  @api count
  @api recordId
  @api objectName
  @api fields
  @api info = []
  @api title;
  @api iconName;
  asynchronous
  
  async connectedCallback() {

    const fields = this.fields.split(",")
    this.count = fields.length

    const res = await getFieldMetaData({objectName: this.objectName, fields: fields});
    console.log("親 → 子", res)
    this.asynchronous = true  
    
    for (let i = 0; i < this.count; i++ ) {
      const data = {
        recordId: this.recordId,
        objectName: this.objectName,
        field: fields[i],
        label: res[i].label,
        type: res[i].type,
        picklistValues: res[i].picklistValues
      }
      this.info.push(data)
    }
  }

  get calCount() {
    const array = [];
    for (let i = 0; i < this.count; i++) {
      array.push(i);
    }
    return array;
  }
}