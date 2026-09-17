import { LightningElement,wire } from 'lwc';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import Opp_Obj from '@salesforce/schema/Opportunity';
import getOpportunityRecord from '@salesforce/apex/OpportunityStateController.getOpportunityRecord';
const CLOUMNS=[
        { label:'Name',fieldName: 'Name', sortable:true },
        { label :'Stage Name' , fieldName: 'StageName' ,sortable:true },
        { label :'Amount' , fieldName: 'Amount' ,type:'currency',sortable:true , sortDirection:'desc' },
        { label :'Close Date' , fieldName: 'CloseDate', type:'date' ,sortable:true }

    ]
export default class OpportunityStageComponent extends LightningElement {

    stageOptions=[];
    selectedStage='';
    showCloseDate = true;
    sortBy='Amount';
    sortDirection = 'desc';
    opportunityList =[];

    
    columns = CLOUMNS;
    @wire(getObjectInfo,{
        objectApiName:Opp_Obj
    })opptObj;

    @wire(getPicklistValues,{
        recordTypeId:'$opptObj.data.defaultRecordTypeId',
        fieldApiName:STAGE_NAME
    })pickListvalues({data,error}){
        if(data){
            let stagevals = data.values.map(curItem=>({
                label:curItem.label,
                value:curItem.value
            }))
            this.stageOptions = [
                {label:'All Stages' , value: 'All'},
                ...stagevals
            ]
        }else if(error){
            console.log('Error: '+ error);
        }
    }

@wire(getOpportunityRecord, {
    stageName: '$selectedStage',
    sortBy: '$sortBy',
    sortDirection: '$sortDirection'
})
opportunities({data,error}){
    if(data){
        this.opportunityList = data;
        console.log('opportunityList: '+ JSON.stringify(this.opportunityList));
    }else{
        console.log('Error: '+ error);
    }
};

    handleStageChange(event){
        this.selectedStage=event.detail.value;
        console.log(this.selectedStage);
    }
    handleShowCloseDate(event){
        this.showCloseDate = event.target.checked;
         this.columns = this.showCloseDate
        ? CLOUMNS
        : CLOUMNS.slice(0, 3);
    }
    handleSort(event){
        this.sortBy= event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
    }
}