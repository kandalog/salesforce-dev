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
  @track itemCountList = [];
  isFirst = false;
  
  asynchronous;


  connectedCallback() {
    console.log("connectedCallback");
    this.provideTabList();
    this.switchContents();
    this.insertItemCountListToProperty();
  }

  renderedCallback() {
    console.log("renderedCallback");    
    this.addClickEventListener();
    this.insertItemCountToSpan();
  }

  get calCount() {
    const array = [];
    for (let i = 0; i < this.count; i++) {
      array.push(i);
    }
    return array;
  }

  // 指数関数的にイベントが付与され、フリーズされるのを防ぐ
  addClickEventListener() {
    if (this.isFirst === false) {
      const tabs = this.template.querySelectorAll('.button-tab');
      tabs[0].classList.add('active');

      for (let i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', (e) => {
          this.asynchronous = false
          this.switchCurrentTab(`tab${i+1}`)
          this.switchContents();
          this.resetActiveTabs();
          e.target.parentNode.classList.add("active")
        })
      }
      this.isFirst = true;
    }
  }

  // tabのアイテム数の配列をプロパティに挿入
  insertItemCountListToProperty() {
    let itemCountList = []
    itemCountList.push(this.fields1 ? this.fields1.split(",").length : 0);
    itemCountList.push(this.fields2 ? this.fields2.split(",").length : 0);
    itemCountList.push(this.fields3 ? this.fields3.split(",").length : 0);
    itemCountList.push(this.fields4 ? this.fields4.split(",").length : 0);
    this.itemCountList = itemCountList
  }

  // タブのアイテム数をspanタグに挿入
  insertItemCountToSpan() {
    const tabParts = this.template.querySelectorAll('.tab-parts');
    for (let i = 0; i < tabParts.length; i++) {
      tabParts[i].textContent = this.itemCountList[i];
    }
  }

  // すべてのボタンからactiveを消す
  resetActiveTabs() {
    const tabs = this.template.querySelectorAll('.button-tab');
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].classList.remove('active');
    }
  }

  // すべてのタブを内包した配列を提供
  provideTabList() {
    let allTabs = [];
    allTabs.push(this.tab1, this.tab2, this.tab3, this.tab4)
    allTabs = allTabs.filter((tab) => tab != undefined && tab != "")
    this.allTabs = allTabs;
  }

  // main-contentsの切り替え
  async switchContents() {
    const fields = this.stringToArray();
    this.count = fields.length;
    
    const res = await getFieldMetaData({objectName: this.objectName, fields: fields});
    this.asynchronous = true

    let info = []
    for (let i = 0; i < this.count; i++ ) {
      const data = {
        recordId: this.recordId,
        objectName: this.objectName,
        field: fields[i],
        label: res[i].label,
        type: res[i].type,
        picklistValues: res[i].picklistValues
      }
      info.push(data)
    }
    this.info = info
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