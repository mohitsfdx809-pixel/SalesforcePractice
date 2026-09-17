public with sharing class CaseManagmentUtilityController {
    @AuraEnabled(cacheable=true)
    public static List<Case> getCaseList(String accountId) {
        String query = 'SELECT Id, CaseNumber, Subject, Status, AccountId , Account.Name ,Contact.Name, createdDate  FROM Case where Status != \'Closed\'';
        if (String.isNotBlank(accountId)) {
            query += ' And AccountId = :accountId';
        }
        query += ' ORDER BY createdDate DESC LIMIT 50';
        List<Case> cases = Database.query(query);
        System.debug('Cases Retrieved: ' + cases);
        return cases;
    }
    @AuraEnabled
    public static void closeCases(List<Id> caseIds) {
        List<Case> casesToUpdate = [SELECT Id, Status FROM Case WHERE Id IN :caseIds];
        for (Case c : casesToUpdate) {
            c.Status = 'Closed';
        }
        update casesToUpdate;
        System.debug('Cases Closed: ' + casesToUpdate);
    }
}