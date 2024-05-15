/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7237}:${Monthly Sales Notification for Sales Rep}
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
 
Send an email notification to all sales representatives once a month.

We need to send the customer sales information from the previous month to the corresponding sales representative.

This email notification should include the Customer Name and Email, Sales Order Document Number, and Sales Amount, which is attached as a CSV File.

If there is no sales representative for the customer, the customer's sales information must send to a static NetSuite admin, along with a message to add a sales representative for the corresponding customers.
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/email', 'N/file', 'N/record', 'N/search'],
    (email, file, record, search) => {
        const getInputData = (inputContext) => {
            var previousMonthSalesOrder = search.create({
                type: "salesorder",
                settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                filters:
                [
                   ["type","anyof","SalesOrd"], 
                   "AND", 
                   ["trandate","within","lastmonth"], 
                   "AND", 
                   ["mainline","is","T"]
                ],
                columns:
                [
                   search.createColumn({name: "entity", label: "Name"}),
                   search.createColumn({name: "email", label: "Email"}),
                   search.createColumn({name: "tranid", label: "Document Number"}),
                   search.createColumn({name: "amount", label: "Amount"}),
                   search.createColumn({name: "salesrep", label: "Sales Rep"})
                ]
             });
            return previousMonthSalesOrder;
        }
        const map = (mapContext) => {
            let searchResult = JSON.parse(mapContext.value);
            let salesrep = searchResult.values['salesrep'].value;
            let salesOrderDetails = {
                'customername': searchResult.values['entity'].text,
                'email': searchResult.values['email'],
                'documentnumber': searchResult.values['tranid'],
                'amount': searchResult.values['amount']
            };
            mapContext.write({
                key: salesrep,
                value: JSON.stringify(salesOrderDetails) 
            });

        }
        const reduce = (reduceContext) => {
            let salesrepid = reduceContext.key;
            let salesDetails = reduceContext.values;
            let csvContent = 'Customer Name,Email,Document,Amount\n';
            salesDetails.forEach((sale) => {
                const fetchData = JSON.parse(sale);
                let customerName = fetchData.customername;
                let customerEmail = fetchData.email;
                let custDocument = fetchData.documentnumber;
                let custAmount = fetchData.amount;
                csvContent += customerName + ',' + customerEmail + ',' + custDocument + ',' + custAmount + '\n';
            });
         
            let csvFile = file.create({
                name: 'last_month_month' + salesrepid + '.csv',
                contents: csvContent,
                fileType: file.Type.CSV,
                folder: 3021
            });
            let csvFileId = csvFile.save();
            log.debug("csvFileId",csvFileId);
            if(salesrepid){
                email.send({
                    author: -5, 
                    recipients: salesrepid,
                    subject: "Sale Order Details ",
                    body: "Please Check the Sales Order Details in below Attachment",
                    attachments: [csvFile],
                });
            }
            else{
                email.send({
                    author: -5, 
                    recipients: 54,
                    subject: "Add Sales Rep",
                    body: "Plesase Add Sales Rep for the Sales Order showing in the below Attechment",
                    attachments: [csvFile],
                });
            }

        }
        return {getInputData, map, reduce}
    });
