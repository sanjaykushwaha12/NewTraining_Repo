/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7215}:${Over Due Customer}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 11-May-2024
 *
 * Created by :Sanjay Kushwaha, Jobin and Jismi IT Services.
 *
 * Description : Send an email alert to the sales manager (of the sales rep) that there is a sales order created for the customers who have Overdue.
 *
 *
*****************************************************************************************************************************************************************************************
******************************/
define(['N/email', 'N/record','N/url'],
    /**
 * @param{email} email
 * @param{record} record
 * @param{search} search
 */
  (email, record, url) => {
    /**
     * Defines the function definition that is executed after record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
      const afterSubmit = (scriptContext) => {
        var currentRecord=scriptContext.newRecord;
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
        if(overDueBalance>=0){
          var salesRep = customer.getValue({
            fieldId: 'salesrep'
          });
          var employeeRecord = record.load({
              type: record.Type.EMPLOYEE,
              id: salesRep
          });
          var salesManager = employeeRecord.getValue({
              fieldId: 'supervisor'
          });
          var customerURL = url.resolveRecord({
            recordType: record.Type.CUSTOMER,
            recordId: customerId
          });
          const emailBody = `Please check the customer: <a href="${customerURL}">Customer ID: ${customerId}</a> who has overdue balance: ${overDueBalance}`;
          if(salesManager){
            email.send({
                author: -5,
                recipients: salesManager,
                subject:"Over Due Customer",
                body:  emailBody,
            });
          }
          else{
            log.debug("No sales Manager for this Sales Rep");
          }
        }   
      }
      return { afterSubmit}
  });






    