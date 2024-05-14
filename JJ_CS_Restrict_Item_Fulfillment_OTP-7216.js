/**
 * @NApiVersion 2.1
 * @NScriptType Client Script
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7216}:${Restrict Item Fulfillment}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 12-May-2024
 *
 * Created by :Sanjay Kushwaha, Jobin and Jismi IT Services.
 *
 * Description : Restrict the Item fulfilment creation if the sales manager checks Don't allow Fullfill
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/record', 'N/ui/dialog'],
    /**
     * @param{currentRecord} currentRecord
     * @param{record} record
     */
    function (record, dialog) {
        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            try {
                let currentRec = scriptContext.currentRecord;
                //Gets the value of sales order attached with item fulfillment.
                let salesOrderId = currentRec.getValue({
                    fieldId: 'createdfrom'
                });
                //Get the Sales Order Details 
                let salesOrderInfo = record.load({
                    type: 'salesorder',
                    id: salesOrderId
                });
                //Load Employee Record to get the Sales Manager Details.
                var empRecord = record.load({
                    type: record.Type.EMPLOYEE,
                    id: 54
                });
                let SalesMangerName = empRecord.getText({
                    fieldId:"entityid"
                });
                let checkBox = salesOrderInfo.getValue({
                    fieldId: 'custbody_restrict_item_fullfill'
                });
                //Check if the Checkbox is Enabled show the Notification message
                if (checkBox) {
                    dialog.alert({
                        title: 'Fulfillment is Not Allowed',
                        message: "Fullfillment for this Item is Restricted by Sales Manager <b>"+SalesMangerName +" <b>"
                      });
                      return false;
                } 
                return true;
            } catch (e) {
                console.error('An error occurred:', e);
            }
        }
        return { saveRecord: saveRecord };
    });

