public with sharing class AccountDataController {
    @auraenabled(cacheable=true)
    public static List<Account> getAccountList() {
        return [SELECT Id, Name FROM Account];
    }
    @auraEnabled(cacheable=true)
    public static relatedWrapper getRelatedAccountData(Id accountId) {
        Account  accounts = [SELECT Id, Name, 
                                            (SELECT Id, FirstName, LastName, Email,Phone FROM Contacts) ,
                                            (SELECT Id, Subject,CaseNumber, Status FROM Cases where Status != 'Closed')
                                    FROM Account
                                    WHERE Id = :accountId
                            ];

        relatedWrapper wrapper = new relatedWrapper();
        wrapper.contacts = accounts.Contacts;
        wrapper.cases = accounts.Cases;
        return wrapper;
    }
    public class relatedWrapper {
        @auraEnabled public List<Contact> contacts {get;set;}
        @auraEnabled public List<Case> cases {get;set;}
        
    }
}