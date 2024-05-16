/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7240}:${Monthly Over Due Reminder for Customer}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 15-May-2024
 *
 * Created by :Sanjay Kushwaha, Jobin and Jismi IT Services.
 *
 * Description : 
    Send a email notification to all Customers once a month if they have overdue Invoices.

    We need to send the Overdue Invoice information till the previous month to the corresponding Customer.

    The email notification should contain all of the customers overdue invoices.

    This email notification should contain the Customer Name and Customer Email, Invoice document Number, Invoice Amount, Days Overdue which is attached as a CSV File to the email.

    The sender of the email should be Sales Rep. If there is no Sales rep for the customer, sender will be a static NetSuite Admin
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/email', 'N/file', 'N/record', 'N/search'],
    /**
 * @param{email} email
 * @param{file} file
 * @param{record} record
 * @param{search} search
 */
    (email, file, record, search) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            var overDueCustomer = search.create({
                type: "invoice",
                settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                filters:
                [
                   ["type","anyof","CustInvc"], 
                   "AND", 
                   ["mainline","is","T"], 
                   "AND", 
                   ["duedate","within","lastmonth"], 
                   "AND", 
                   ["status","anyof","CustInvc:A"]
                ],
                columns:
                [
                   search.createColumn({name: "entity", label: "Name"}),
                   search.createColumn({name: "email", label: "Email"}),
                   search.createColumn({name: "tranid", label: "Document Number"}),
                   search.createColumn({name: "amount", label: "Amount"}),
                   search.createColumn({name: "duedate", label: "Due Date/Receive By"}),
                   search.createColumn({name: "daysoverdue", label: "Days Overdue"}),
                   search.createColumn({name: "statusref", label: "Status"}),
                   search.createColumn({name: "salesrep", label: "Sales Rep"})
                ]
             });
             return overDueCustomer;
        }
        const map = (mapContext) => {
            let searchResult = JSON.parse(mapContext.value);
            let customerID = searchResult.values['entity'].value;
            // let salesrep=searchResult.values['salesrep'].value;
            let invoiceDetails = {
                'customername': searchResult.values['entity'].text,
                'email': searchResult.values['email'],
                'documentnumber': searchResult.values['tranid'],
                'amount': searchResult.values['amount'],
                'daysoverdue': searchResult.values['daysoverdue'],
                'salesrep': searchResult.values['salesrep'].value
            };
            mapContext.write({
                key: customerID,
                value: JSON.stringify(invoiceDetails) 
            });
        }
        const reduce = (reduceContext) => {
            var customerId = reduceContext.key;
            var invoiceDetails = reduceContext.values;
            var csvContent = 'Customer Name, Email, Document, Amount , Days Overdue\n';
            var salesrepId='';
            invoiceDetails.forEach((invoice) => {
                const fetchData = JSON.parse(invoice);
                var customerName = fetchData.customername;
                var customerEmail = fetchData.email;
                var custDocument = fetchData.documentnumber;
                var custAmount = fetchData.amount;
                var dauOverdue = fetchData.daysoverdue;
                salesrepId = fetchData.salesrep;
                csvContent += customerName + ',' + customerEmail + ',' + custDocument + ',' + custAmount + ',' + dauOverdue + '\n';
            });
            log.debug("sales rep ID",salesrepId);
            var csvFile = file.create({
                name: 'overDue_Invoice' + customerId + '.csv',
                contents: csvContent,
                fileType: file.Type.CSV,
                folder: 3022
            });
            var csvFileId = csvFile.save();
            if(salesrepId){
                email.send({
                    author: salesrepId, 
                    recipients: customerId,
                    subject: "OverDue Invoice ",
                    body: "PLease check the Attachment below for your Overdue Invoice",
                    attachments: [csvFile],
                });
            }
            else{
                email.send({
                    author: -5, 
                    recipients: customerId ,
                    subject: "OverDue Invoice ",
                    body: "PLease check the Attachment below for your Overdue Invoice",
                    attachments: [csvFile],
                });

            }

        }
        return {getInputData, map, reduce, summarize}

    });
