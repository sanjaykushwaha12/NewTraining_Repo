/**
 * @NApiVersion 2.x
 * @NScriptType Client Script
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7214}:${OverDue Warning}
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
 * Description : send Warning message to the sales rep if Sales order is created with the Customer having OverDue balance
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
define(['N/record', 'N/ui/dialog'],
/**
 * @param{record} record
 * @param{dialog} dialog
 */
function(record, dialog) {
    /**
   * Function to be executed when field is changed.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.sublistId - Sublist name
   * @param {string} scriptContext.fieldId - Field name
   * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
   * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
   *
   * @since 2015.2
   */
    function saveRecord(scriptContext) {
      var currentRecord=scriptContext.currentRecord;
      var customerId=currentRecord.getValue({
        fieldId:"entity"
      })
      var customerRecord = record.load({
          type: record.Type.CUSTOMER,
          id: customerId
      });
      var overDueBalance = customerRecord.getValue({
        fieldId: 'overduebalance'
      });
      if(overDueBalance > 0){
          dialog.alert({
            title: 'OverDue Customer',
            message: 'This Customer have OverDue Balance of '+ overDueBalance
          });
          return false; 
      }
      return true;
    }
    return {
        saveRecord: saveRecord
    };  
});
