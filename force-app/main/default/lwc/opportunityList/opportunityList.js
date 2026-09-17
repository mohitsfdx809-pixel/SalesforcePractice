import { LightningElement, wire } from 'lwc';
import getOpportunities from '@salesforce/apex/DataController.getOpportunities';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import {getObjectInfo,getPicklistValues} from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';

export default class OpportunityList extends NavigationMixin(LightningElement) {
    draftValues = [];
    wiredOpportunityResult;
    opportunities = [];
    filteredOpportunities = [];

    selectedProgress ='inProgress';
    searchKey = '';
    selectedStage = 'All';

    isLoading = true;
    error;

    get progressOptions(){
        return [
            { label: 'In Progress', value: 'inProgress' },
            { label: 'Completed', value: 'completed' }
        ];
    }
    handleChange(event) {
        this.value = event.detail.value;
    }
    // Datatable columns
    columns = [
        {
            label: 'Opportunity Name',
            fieldName: 'recordUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_blank'
            }
        },
        {
            label: 'Account',
            fieldName: 'accountName',
            type: 'text'
        },
        {
            label: 'Stage',
            fieldName: 'StageName',
            type: 'stagePicklist',
            editable: true,
            typeAttributes: {
                options: { fieldName: 'stageOptions' }
            }
        },
        {
            label: 'Amount',
            fieldName: 'Amount',
            type: 'currency',
            editable: true
        },
        {
            label: 'Close Date',
            fieldName: 'CloseDate',
            type: 'date',
            editable: true
        }
    ];

    get tableData() {
        return this.filteredOpportunities.map(opp => ({
            ...opp,
            stageOptions: this.stageOptions
        }));
    } 
    // Get Opportunity metadata
    @wire(getObjectInfo, {
        objectApiName: OPPORTUNITY_OBJECT
    })
    opportunityInfo;


    // Get Stage picklist values using LDS
    @wire(getPicklistValues, {
        recordTypeId: '$opportunityInfo.data.defaultRecordTypeId',
        fieldApiName: STAGE_FIELD
    })
    stagePicklistValues;


    // Stage combobox options
    get stageOptions() {
        if (!this.stagePicklistValues.data) {
            return [];
        }

        return [
            ...this.stagePicklistValues.data.values.map(stage => ({
                label: stage.label,
                value: stage.value
            }))
        ];
    }


    // Get Opportunities from Apex
   @wire(getOpportunities)
wiredOpportunity(result) {

    this.wiredOpportunityResult = result;

    const { data, error } = result;

    this.isLoading = false;

    if (data) {
        this.opportunities = data.map(opp => ({
            ...opp,
            accountName: opp.Account ? opp.Account.Name : '',
            recordUrl: '/' + opp.Id,
            stageOptions: this.stageOptions
        }));

        this.filteredOpportunities = this.opportunities;
        this.error = undefined;

    } else if (error) {

        this.error = error;
        this.opportunities = [];
        this.filteredOpportunities = [];
    }
}

    // Search
    handleSearch(event) {

        this.searchKey = event.target.value.toLowerCase();

        this.applyFilters();
    }


    // Stage filter
    handleStageChange(event) {

        this.selectedStage = event.detail.value;

        this.applyFilters();
    }


    // Apply search + stage filter
    applyFilters() {

        this.filteredOpportunities = this.opportunities.filter(opp => {

            const matchesSearch =
                opp.Name &&
                opp.Name.toLowerCase().includes(this.searchKey);

            const matchesStage =
                this.selectedStage === 'All' ||
                opp.StageName === this.selectedStage;

            return matchesSearch && matchesStage;
        });
    }


    // New Opportunity
    handleNewOpportunity() {

        this[NavigationMixin.Navigate]({

            type: 'standard__objectPage',

            attributes: {
                objectApiName: 'Opportunity',
                actionName: 'new'
            }

        });
    }

    // Handle Save
    async handleSave(event) {

        const records = event.detail.draftValues.map(draft => {
            return {
                fields: {
                    ...draft
                }
            };
        });

        try {

            await Promise.all(
                records.map(record => updateRecord(record))
            );

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Opportunity updated successfully',
                    variant: 'success'
                })
            );

            this.draftValues = [];

            await refreshApex(this.wiredOpportunityResult);

        } catch (error) {
            console.log('FULL ERROR:', JSON.stringify(error));
            console.log('ERROR:', error);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || error.message || 'Something went wrong',
                    variant: 'error'
                })
            );
        }
    }
   
}