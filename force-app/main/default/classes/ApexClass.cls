public with sharing class ApexClass {

  @AuraEnabled
  public static void hello() {
    Object obj = 23;
    return obj;
  }

  @AuraEnabled
  public static String hoge(String name, Integer age) {
    String greeting = name + 'です。' + String.valueOf(age) + '歳です。';
    return greeting;
  }
}

