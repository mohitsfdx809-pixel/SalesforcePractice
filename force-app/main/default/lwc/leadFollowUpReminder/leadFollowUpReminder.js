import { LightningElement, api, wire } from 'lwc';
import getLead from '@salesforce/apex/DataController.leadData';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FOLLOW_UP_FIELD from '@salesforce/schema/Lead.Follow_Up_Done__c';

export default class LeadFollowUpReminder extends LightningElement {

    @api recordId;

    lead;
    error;
    isSaving = false;

    @wire(getLead, { leadId:'$recordId' })
    wiredLead({ data, error }) {

        if (data) {
            this.lead = data;
            console.log(JSON.stringify(this.lead));
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.lead = undefined;
        }
    }

    get isFollowUpRequired() {

        // If follow-up is already done
        if (this.lead?.Follow_Up_Done__c) {
            return false;
        }

        // If there has never been an activity
        if (!this.lead?.LastActivityDate) {
            return true;
        }

        const lastActivity = new Date(this.lead.LastActivityDate);
        const today = new Date();

        const difference =
            today.getTime() - lastActivity.getTime();

        const daysSinceActivity =
            difference / (1000 * 60 * 60 * 24);

        return daysSinceActivity >= 3;
    }

    get reminderMessage() {

        if (!this.lead) {
            return '';
        }

        if (!this.lead.LastActivityDate) {
            return 'No activity has been recorded for this Lead.';
        }

        return 'No activity in the last 3 days. Follow-up is required.';
    }

    async handleFollowUpDone() {

        this.isSaving = true;

        const fields = {};

        fields.Id = this.recordId;
        fields[FOLLOW_UP_FIELD.fieldApiName] = true;

        const recordInput = {
            fields: fields
        };

        try {

            await updateRecord(recordInput);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Follow-Up marked as done.',
                    variant: 'success'
                })
            );

            // Update local data immediately
            this.lead = {
                ...this.lead,
                Follow_Up_Done__c: true
            };

        } catch (error) {

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message:
                        error.body?.message ||
                        'Unable to update Lead.',
                    variant: 'error'
                })
            );

        } finally {

            this.isSaving = false;
        }
    }
}