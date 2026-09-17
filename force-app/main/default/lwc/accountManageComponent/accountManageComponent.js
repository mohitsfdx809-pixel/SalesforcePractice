import { LightningElement, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountRelatedDataController.getAccounts';
import getRelatedData from '@salesforce/apex/AccountRelatedDataController.getRelatedData';

export default class AccountManageComponent extends LightningElement {
    accounts = [];
    error;
    opportunityData = [];
    casesData = [];
    columns = [
        { label: 'Account Name', fieldName: 'nameUrl' , type: 'url',
            typeAttributes: { 
                label: { fieldName: 'name' }, 
                target: '_blank'
            } 
        },
        { label: 'Industry', fieldName: 'industry' }

    ];
    opportunityColumns = [
        { label: 'Opportunity Name', fieldName: 'Name' },
        { label: 'Stage', fieldName: 'StageName' },
        { label: 'Amount', fieldName: 'Amount', type: 'currency' }
    ];
    caseColumns = [
        { label: 'Case Number', fieldName: 'CaseNumber' },
        { label: 'Status', fieldName: 'Status' },
        { label: 'Priority', fieldName: 'Priority' }
    ];
    @wire(getAccounts)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accounts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accounts = [];
        }
    }
   async handleRowAction(event) {
    const selectedRows = event.detail.selectedRows;
    let selectedAccountIds = selectedRows.map(row => row.accountId);
    try {
        const relatedData = await getRelatedData({ accountIds: selectedAccountIds });
        this.opportunityData = relatedData.opportunities;
        this.casesData = relatedData.cases; 
        this.error = undefined;
    } catch (error) {
        console.error('Error fetching related data:', error);
    }

  }

}