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
 * Description : Restrict the Item fulfilment if Customer Deposite is less then Sales Order Amount
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/record', 'N/search', 'N/ui/dialog'],
    function (record, search , dialog) {
        function saveRecord(scriptContext) {
            try {
                var currentRecord = scriptContext.currentRecord;
                let currentrecordType=currentRecord.type;
                if(currentrecordType==="itemfulfillment"){
                    var salesOrderId = currentRecord.getValue({
                        fieldId: 'createdfrom'
                    });
                    var salesOrder = record.load({
                        type: record.Type.SALES_ORDER,
                        id: salesOrderId,
                        isDynamic: true
                    });   
                    var totalAmount = salesOrder.getValue({
                        fieldId: 'total'
                    });
                    let subListId="links";
                    var lineCount = salesOrder.getLineCount({
                        sublistId: subListId
                    });
                    if(lineCount>0){
                        var mySearch = search.create({
                            type: search.Type.CUSTOMER_DEPOSIT,
                            filters: [['salesorder', 'anyof', salesOrderId], 'AND', ["mainline", "is", "T"]],
                            columns: ['amount']
                        });
                        var searchResult = mySearch.run().getRange({
                            start: 0,
                            end: 100
                        });
                        for (var i = 0; i < searchResult.length; i++) {
                            var depositeAmount = searchResult[i].getValue({
                                name: 'amount'
                            });
                            log.debug("depositeAmount",depositeAmount);
                            if ( depositeAmount < totalAmount) {
                                dialog.alert({
                                    title: 'Insufficient Customer Deposite',
                                    message: 'Customer Deposite is Amount is: <b>'+ depositeAmount +'</b> and Sales Order Amount is: <b>'+ totalAmount +'</b> Please Deposite more Amount to fulfill the Order '
                                });
                                return false;
                                
                            } else {
                                return true; 
                            }
                        }

                    }
                    else{
                        return false;
                    }  
                }
            }
            catch (e) {
                log.error(e);
            }
        }
        return {
            saveRecord: saveRecord
        };
    });
