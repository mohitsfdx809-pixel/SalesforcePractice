import LightningDatatable from 'lightning/datatable';
import stageDisplayTemplate from './stageDisplayTemplate.html';
import stageEditTemplate from './stageEditTemplate.html';

export default class OpportunityDatatable extends LightningDatatable {
    static customTypes = {
        stagePicklist: {
            template: stageDisplayTemplate,
            editTemplate: stageEditTemplate,

            standardCellLayout: true,
            typeAttributes: [
                'options'
            ]
        }
    };
}