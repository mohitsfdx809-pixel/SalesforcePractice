public with sharing class AccountRelatedDataController {
    @AuraEnabled(cacheable=true)
    public static List<AccountWrapper> getAccounts(){
        List<AccountWrapper> accountWrappers = new List<AccountWrapper>();
        for(Account acc : [SELECT Id, Name, Industry FROM Account LIMIT 50]){
            AccountWrapper wrapper = new AccountWrapper();
            wrapper.name = acc.Name;
            wrapper.industry = acc.Industry;
            wrapper.accountId = acc.Id;
            wrapper.nameUrl = '/' + acc.Id;
            accountWrappers.add(wrapper);
        }
        return accountWrappers;



        
    }
    @AuraEnabled(cacheable=true)
    public static AccountRelatedWrapper getRelatedData(List<Id> accountIds){

        List<case> cases = new List<case>();
        List<Opportunity> opportunities = new List<Opportunity>();

        List<Account> accounts = [SELECT Id, Name, 
            (SELECT Id, CaseNumber, Status , Priority FROM Cases  ORDER BY CreatedDate DESC LIMIT 50),
            (Select Id, Name , StageName, Amount FROM Opportunities ORDER BY CreatedDate DESC LIMIT 50)
         FROM Account WHERE Id IN :accountIds];
        for(Account acc : accounts){
            cases.addAll(acc.Cases);
            opportunities.addAll(acc.Opportunities);
        }
        return new AccountRelatedWrapper(cases, opportunities);
    }
    public class AccountRelatedWrapper {
        @AuraEnabled public List<Case> cases {get;set;}
        @AuraEnabled public List<Opportunity> opportunities {get;set;}

        public AccountRelatedWrapper(List<Case> cases, List<Opportunity> opportunities){
            this.cases = cases;
            this.opportunities = opportunities;
        }

        
    }
    public class AccountWrapper{
        @AuraEnabled public String name;
        @AuraEnabled public String industry;
        @AuraEnabled public String accountId;
        @AuraEnabled public String nameUrl;

    }
}