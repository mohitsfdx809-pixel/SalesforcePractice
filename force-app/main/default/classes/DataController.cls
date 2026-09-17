public with sharing class DataController  {
   @AuraEnabled(cacheable=true)
   public static  List<Opportunity> getOpportunities(){
    return [
            SELECT Id,
                   Name,
                   Account.Name,
                   StageName,
                   Amount,
                   CloseDate
            FROM Opportunity
            ORDER BY CreatedDate DESC
            LIMIT 100
        ];
   }
   @AuraEnabled(cacheable=true)
   public static List<Lead> getLeads(){
      return [
         SELECT Id, Name, Company, Status, Email FROM Lead ORDER BY CreatedDate DESC LIMIT 100
      ];
   }
   @AuraEnabled(cacheable=true)
   public static Lead  leadData(Id leadId){
      return [Select Id,CreatedDate, LastActivityDate , Follow_Up_Done__c from lead where Id=:leadId limit 1];
   }

}