import { LightningElement ,wire} from 'lwc';
import getCaseList from '@salesforce/apex/CaseManagmentUtilityController.getCaseList';
import closeCases from '@salesforce/apex/CaseManagmentUtilityController.closeCases';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CaseManagmentComponent extends LightningElement {
    wiredCasesResult=[];
    cases=[];
    error;
    selectedAccountId='';
    selectedRows=[];
    

    disabledButton=true;


    isLoading = false;
    caseColumns=[
        {label:'Case Number',fieldName:'CaseNumber'},
        {label:'Subject',fieldName:'Subject'},
        {label:'Status',fieldName:'Status'},
        {label:'Account Name',fieldName:'AccountName'},
        {label:'Contact Name',fieldName:'ContactName'}

    ];
    @wire(getCaseList, { accountId: '$selectedAccountId' })
    cases(result){
        this.wiredCasesResult =result;
        if(result.data){
            this.cases=this.processData(result.data);
        }
        else if(result.error){
            this.error = result.error;
        }
    }
    processData(caseData){
        let processResponces = caseData.map(curItem => ({
            ...curItem,
            AccountName: curItem.Account?.Name || 'N/A',
            ContactName: curItem.Contact?.Name || 'N/A'
        }));
        return processResponces;
    }     
    handleAccountChange(event){
        this.selectedAccountId=event.detail.recordId;
        console.log('Selected Account Id:',this.selectedAccountId);
        this.selectedRows = [];
        this.disabledButton=true;
    }
    async closeSelectedCases(){
        this.isLoading = true;
        const caseIds = this.selectedRows.map(row => row.Id);
        try {
            await closeCases({ caseIds });
            this.selectedRows = [];
            this.disabledButton = true;
            await refreshApex(this.wiredCasesResult);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success',
                message: 'Selected cases have been closed successfully.',
                variant: 'success'
            }));

            
        } catch (error) {
            console.error('Error closing cases:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Failed to close selected cases.',
                variant: 'error'
            }));
        } finally {
            this.isLoading = false;
        }
    }
    handleRowSelection(event){
        
        this.selectedRows = event.detail.selectedRows;
        this.disabledButton = this.selectedRows.length === 0;
    }        
   
    get isDataLoaded(){

        return this.cases.length > 0;
    }
    get totalOpenCasesCount(){
        return this.cases.length;
    }
    get totalSelectedCasesCount(){
        return this.selectedRows.length;
    }

}
