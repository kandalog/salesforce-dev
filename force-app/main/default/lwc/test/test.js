import { LightningElement, api, track } from 'lwc';

import getFieldMetaData from '@salesforce/apex/ProvideMetaData.getFieldMetaData';

export default class Test extends LightningElement {
  @api objectName;
  @api recordId
  @track info = []
  count;

  @api tab1;
  @api fields1;
  isTab1 = true;

  @api tab2;
  @api fields2;
  isTab2 = false;

  @api tab3;
  @api fields3;
  isTab3 = false;

  @api tab4;
  @api fields4;
  isTab4 = false;

  @track allTabs;
  isFirst = false;
  
  asynchronous;


  async connectedCallback() {
    console.log("connectedCallback");
    // tab?を繰り返し処理でレンダリングするためtab?をまとめた配列を作成
    let allTabs = [];
    allTabs.push(this.tab1, this.tab2, this.tab3, this.tab4)
    allTabs = allTabs.filter((tab) => tab != undefined && tab != "")
    this.allTabs = allTabs;

    await this.switchContents()
  }


  get calCount() {
    const array = [];
    for (let i = 0; i < this.count; i++) {
      array.push(i);
    }
    return array;
  }

  renderedCallback() {
    console.log("renderedCallback");
    // 指数関数的にイベントが付与され、フリーズされるのを防ぐ
    if (this.isFirst === false) {
      const tabs = this.template.querySelectorAll('.button-tab');
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', () => {
          this.asynchronous = false
          this.switchCurrentTab(`tab${i+1}`)
          this.switchContents();
          // console.log(this.info[0].label);
        })
      }
      this.isFirst = true;
    }
  }

  // disconnectedCallback() {
  //   console.log("呼び出し");
  //   this.asynchronous = false
  // }

  // apexをcallし、info配列を作成する
  async switchContents() {
    const fields = this.stringToArray();
    this.count = fields.length;
    // console.log("fields", fields[0]);
    // console.log("count", this.count);
    
    const res = await getFieldMetaData({objectName: this.objectName, fields: fields});
    // console.log("メタデータ", res);
    // ここまではうまく動いている
    // this.asynchronous = true
    this.asynchronous = true

    // 下記がうまく動いていない
    this.info = [];
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

    console.log("op", this.info[0].field);
  }

  // 現在のisTab?をTrueに、他をfalseにする
  switchCurrentTab(currentTab) {
    this.turnOff();

    switch(currentTab) {
      case 'tab1':
        this.isTab1 = true;
        break;
      case 'tab2':
        this.isTab2 = true;
        break;
      case 'tab3':
        this.isTab3 = true;
        break;
      case 'tab4':
        this.isTab4 = true;
        break;
      default:
        console.log("switchCurrentTabメソッドが起動しましたが、該当なしのためdefaultが発動しました")
        this.isTab1 = true;
    }
  }

  // 全てのタブをfalseにする
  turnOff() {
    this.isTab1 = false;
    this.isTab2 = false;
    this.isTab3 = false;
    this.isTab4 = false;
  }

  // 現在のTabに応じた項目の配列を返却
  stringToArray() {
    if (this.isTab1) {
      return this.fields1.split(",");
    }
    if (this.isTab2) {
      return this.fields2.split(",");
    }
    if (this.isTab3) {
      return this.fields3.split(",");
    }
    if (this.isTab4) {
      return this.fields4.split(",");
    }
    return this.fields1.split(",");
  }
}