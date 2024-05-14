/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
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
define(['N/error', 'N/record'],
    ( error, record) => {
        const beforeSubmit = (scriptContext) => {
            let recordType = scriptContext.newRecord.type;
            if (recordType == record.Type.ITEM_FULFILLMENT) {
                let currentRec = scriptContext.newRecord;
                //Fetch the details of sales order.
                let salesOrderId = currentRec.getValue('createdfrom');
                let salesInfo = record.load({
                    type: 'salesorder',
                    id: salesOrderId
                });
                //check whether the Don't Allow fulfillment is checked.
                let checkbox = salesInfo.getValue({
                    fieldId: "custbody_restrict_item_fullfill"
                });
                //Fetch the Sales Manager Details
                var employeeRecord = record.load({
                    type: record.Type.EMPLOYEE,
                    id: 54
                });
                let SalesMangerName = employeeRecord.getText({
                    fieldId:"entityid"
                });
               // if Checkbox is enabled Throw error message
                if (checkbox) {
                    let errorMsg = error.create({
                        name: 'SALES_ORDER_ERROR',
                        message: 'Fulfillment for the sales order ID: ' + salesOrderId + 'is restricted by the Sales Manager ' + "<b>" +SalesMangerName +"</b>" + " Please Contact with Him",
                        notifyOff: false
                    });
                    alert('Fulfillment is restricted by the Sales Manager.');
                    throw errorMsg;
                }
            }
        }
        return { beforeSubmit }
    });