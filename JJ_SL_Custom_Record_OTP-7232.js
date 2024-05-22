/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7232}:${External Custom Record form and actions}
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
 * Description : Create a custom record type with the following fields:

Customer Name

Customer Email

Customer (Reference to Customer)

Subject

Message

Entries to the custom record can be made externally (without NetSuite access)

If there is a customer with the given email Id, link that customer to the custom record.

Whenever there is an entry in a custom record, send a notification to a static NetSuite Admin.

If there is a Sales Rep for the customer, send a notification email to the Sales Rep as well.
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/url','N/email'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (record, search, serverWidget, url, email) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
        try{

           
            if (scriptContext.request.method === 'GET') {
                // Create new form
                var customerform = serverWidget.createForm({
                    title: 'Custom Customer Record'
                });
                // Add field to newly Created from
                customerform.addField({
                    id: '_jj_cust_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });
                customerform.addField({
                    id: '_jj_cust_email',
                    type: serverWidget.FieldType.EMAIL,
                    label: 'Customer Email'
                });
            
                customerform.addField({
                    id: '_jj_cust_subject',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Subject'
                });
                customerform.addField({
                    id: '_cust_referance',
                    type: serverWidget.FieldType.URL,
                    label: "Customer Refereance"
                });
                customerform.addField({
                    id: '_jj_cust_message',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'Message'
                });
                customerform.addSubmitButton({
                    label: 'Submit'
                });
                scriptContext.response.writePage(customerform);
           
            } 
       
            else if (scriptContext.request.method === 'POST') {
                // Get Dats from Form
                var name = scriptContext.request.parameters._jj_cust_name;
                var custemail = scriptContext.request.parameters._jj_cust_email;
                var subject = scriptContext.request.parameters._jj_cust_subject;
                var message = scriptContext.request.parameters._jj_cust_message;
                var referance = scriptContext.request.parameters._cust_referance;
                let customerURL = '';
                if (custemail) {
                    log.debug("of is executrd");
                    var customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: ['email', 'is', custemail],
                        columns: ['salesrep', 'entityid', 'internalid']
                    }).run().getRange({ start: 0, end: 1 });

                    if (customerSearch.length > 0) {
                        var customerId = customerSearch[0].getValue({
                             name: 'internalid' 
                        });
                        customerURL = url.resolveRecord({
                            recordType: record.Type.CUSTOMER,
                            recordId: customerId
                        });
                    }
                }
                //Create record with Form Data
                var customRecord = record.create({
                    type: 'customrecord_jj_customer_record',
                    isDynamic: true
                });
                customRecord.setValue({
                    fieldId: 'custrecord_jj_customer_name',
                    value: name
                });
                customRecord.setValue({
                    fieldId: 'custrecord_jj_customer_email',
                    value: custemail
                });
                customRecord.setValue({
                    fieldId: 'custrecord_jj_cust_subject',
                    value: subject
                });
                customRecord.setValue({
                    fieldId: 'custrecord_jj_cust_message',
                    value: message
                });
                if (customerURL) {
                    customRecord.setValue({
                        fieldId: 'custrecordjj_customer_reference',
                        value: customerURL
                    });
                }
                else{
                    customRecord.setValue({
                        fieldId: 'custrecordjj_customer_reference',
                        value: referance
                    });

                }
                var recordId = customRecord.save({
                    ignoreMandatoryFields: false,
                    enableSourcing: true
                });
                    // Display submitted form details
            var submittedDetails = 
            'ID: ' + recordId + '<br>' +
            'Employee Name: ' + name + '<br>' +
            'Email: ' + custemail + '<br>' +
            "Subject: " + subject + '<br>' +
            "Message: " + message + '<br>';
            scriptContext.response.write(submittedDetails);  
            //call the function to send E-mail
                if(recordId){
                    sendEmail(recordId, custemail)
                }
            }
        }
        catch (error){
            log.error('Error in creating record', error);
            throw error;
        }
        }
        function sendEmail(recordId, custemail) {
            try {
                let salesRep = '';
                if (custemail) {
                    var customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: ['email', 'is', custemail],
                        columns: ['salesrep', 'entityid']
                    }).run().getRange({ start: 0, end: 1 });

                    if (customerSearch.length > 0) {
                        salesRep = customerSearch[0].getValue({ name: 'salesrep' });
                    }
                }
                email.send({
                    author: -5,
                    recipients: [-5, salesRep],
                    subject: 'New Record Created',
                    body: "New Record is created with id ID: " + recordId
                });
            } catch (error) {
                log.error('Error in sendEmail', error);
                throw error;
            }
        }

        return { onRequest }
    });