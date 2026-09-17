import { LightningElement ,wire} from 'lwc';
import getAccountList from '@salesforce/apex/AccountDataController.getAccountList';
import getRelatedAccountData from '@salesforce/apex/AccountDataController.getRelatedAccountData';


export default class AccountReletedDataComponent extends LightningElement {

    accountOptions=[];
    cases=[];
    contacts=[];
    caseColumns=[
        {label:'Case Number',fieldName:'CaseNumber'},
        {label:'Subject',fieldName:'Subject'},
        {label:'Status',fieldName:'Status'}
    ];
    contactColumns=[
        {label:'First Name',fieldName:'FirstName'},
        {label:'Last Name',fieldName:'LastName'},
        {label:'Email',fieldName:'Email'},
        {label:'Phone',fieldName:'Phone'}
    ];

    @wire(getAccountList)
    accountList({data,error}){
        if(data){
            this.accountOptions=data.map(curItem=>({
                label:curItem.Name,
                value:curItem.Id
            }))
        }
        if(error){
            console.error('Error:',error);
        }
    }




    async handleAccountChange(event){
        const selectedAccountId=event.detail.value;
        console.log('Selected Account Id:',selectedAccountId);
        try {
            const relatedData = await getRelatedAccountData({ accountId: selectedAccountId });
            console.log('Related Data:', relatedData);
            this.cases = relatedData.cases || [];
            this.contacts = relatedData.contacts || [];
        } catch (error) {
            console.error('Error fetching related account data:', error);
        }
    }

}