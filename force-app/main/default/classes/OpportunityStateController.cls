public with sharing class OpportunityStateController {
    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getOpportunityRecord(String stageName, String sortBy, String sortDirection) {
        String query = 'Select Id , Name , StageName , CloseDate , Amount from Opportunity';
        if (String.isNotBlank(stageName) && stageName != 'All') {
           query += ' WHERE StageName = :stageName';
        }
        if (String.isBlank(sortBy)) {
            query += ' ORDER BY Amount DESC';
        } else {
            query += ' ORDER BY ' + String.escapeSingleQuotes(sortBy) + ' '
                + String.escapeSingleQuotes(sortDirection);
        }
        return Database.query(query);
    }
}