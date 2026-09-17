import { LightningElement ,wire} from 'lwc';
import getleads from '@salesforce/apex/DataController.getLeads';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class LeadTable extends LightningElement {
    leads = [];
    error;
    isSaving = false;
    draftValues=[];
    columns = [
        {
            label:'Name',
            fieldName:'Name',
            type:'text',
            editable:true
        },
        {
            label:'Company',
            fieldName:'Company',
            type:'text',
            editable:true
        },
        {
            label:'Status',
            fieldName:'Status',
            type:'text'
        },
        {
            label:'Email',
            fieldName:'Email',
            type:'email',
            editable:true
        }
    ]

    @wire(getleads)
    wiredLeads({ data, error }) {
        if (data) {
            this.leads = data.map(lead => ({
                ...lead,
                recordUrl: '/' + lead.Id
                
            }));
            this.error = undefined;
            
        }  else if (error) {
            this.error = error;
            this.leads = [];
        }
    }
    async handleSave(event) {

    // Show spinner
        this.isSaving = true;

        const records = event.detail.draftValues.map(draft => ({
            fields: {
                ...draft
            }
        }));

        try {

            // Update records
            await Promise.all(
                records.map(record => updateRecord(record))
            );

            // Get fresh data from Salesforce
            await refreshApex(this.wiredLeadResult);

            // Clear draft values
            this.draftValues = [];

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Lead updated successfully',
                    variant: 'success'
                })
            );

        } catch (error) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error.body?.message ||
                        'Unable to update Lead',
                    variant: 'error'
                })
            );

        } finally {

            // Hide spinner
            this.isSaving = false;
        }
    }
}