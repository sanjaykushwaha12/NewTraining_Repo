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
            try {
                if (scriptContext.request.method === 'POST') {
                    var customerRecord = JSON.parse(scriptContext.request.body);
                    let name = customerRecord.name;
                    let emailAddr = customerRecord.email;
                    let subject = customerRecord.subject;
                    let message = customerRecord.message;
                    let customRecId = createCustomRecord(name, emailAddr, subject, message);
                    var detailsHtml = '<h2>Customer Record id Created with RecordId</h2> ' + customRecId;
                    sendEmail(customRecId, emailAddr);
                    scriptContext.response.write(detailsHtml);
                }
            } catch (error) {
                log.error('Error in onRequest', error);
                scriptContext.response.write('Error: ' + error.message);
            }
        }

        function createCustomRecord(name, emailAddr, subject, message) {
            try {
                let customerURL = '';
                if (emailAddr) {
                    var customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: ['email', 'is', emailAddr],
                        columns: ['salesrep', 'entityid', 'internalid']
                    }).run().getRange({ start: 0, end: 1 });

                    if (customerSearch.length > 0) {
                        var customerId = customerSearch[0].getValue({ name: 'internalid' });
                        customerURL = url.resolveRecord({
                            recordType: record.Type.CUSTOMER,
                            recordId: customerId
                        });
                    }
                }

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
                    value: emailAddr
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
                        fieldId: 'custrecord_jj_customer_reference',
                        value: customerURL
                    });
                }
                var recordId = customRecord.save({
                    ignoreMandatoryFields: false,
                    enableSourcing: true
                });
                return recordId;
            } catch (error) {
                log.error('Error in createCustomRecord', error);
                throw error;
            }
        }

        function sendEmail(customRecId, emailAddr) {
            try {
                let salesRep = '';
                if (emailAddr) {
                    var customerSearch = search.create({
                        type: search.Type.CUSTOMER,
                        filters: ['email', 'is', emailAddr],
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
                    body: "New Record is created with id ID: " + customRecId
                });
            } catch (error) {
                log.error('Error in sendEmail', error);
                throw error;
            }
        }

        return { onRequest }
    });